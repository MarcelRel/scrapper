import fs from "fs";
import path from "path";
import csv from "csv-parse";
import {getConnection} from "./utils/db";
import {InductionListForPreviousHourRecord} from "./records/inductionListForPreviousHour-record";
import dotenv from 'dotenv';
import {formatDate} from "./utils/formatDate";
import {runSeleniumTest} from "./utils/downloadingData";


dotenv.config();

export const parseCSVAndSaveToDB = async (filepath: string): Promise<void> => {
    const connection = await getConnection();
    const fileContentStream = fs.createReadStream(filepath);
    const parser = csv.parse({
        delimiter: ',',
        trim: true,
        skip_empty_lines: true,
    });
    let flagFirst = true;
    const inductionListForPreviousHourRecords: InductionListForPreviousHourRecord[] = [];

    fileContentStream.pipe(parser)
        .on('data', (record) => {
            if (flagFirst) {
                flagFirst = false;
            } else {
                if (path.basename(filepath) == 'BI_InductionListForPreviousHour.csv') {
                    const [wave, tote, article, batch, quantity, time, station] = record[0].split(';');

                    const newObj = new InductionListForPreviousHourRecord({
                        wave,
                        tote: tote === ' ' ? null : tote,
                        article: article === ' ' ? null : article,
                        batch: batch === ' ' ? null : batch,
                        quantity: quantity === ' ' ? null : quantity,
                        time: new Date(time),
                        station,
                    });
                    inductionListForPreviousHourRecords.push(newObj);
                }
            }
        })
        .on('end', async () => {
            try {
                const inductionListForPreviousHourRecordsExistingIds = await InductionListForPreviousHourRecord.getExistingIds(connection);
                const newInductionListForPreviousHourRecords = inductionListForPreviousHourRecords.filter(record =>
                {
                    const timeStr = formatDate(record.time);
                    const recordKey = `${timeStr}-${record.wave}-${record.tote}-${record.article}`;
                    // console.log(recordKey)
                    return !inductionListForPreviousHourRecordsExistingIds.has(recordKey);
                });

                if (newInductionListForPreviousHourRecords.length > 0) {
                    await InductionListForPreviousHourRecord.insertAll(connection, newInductionListForPreviousHourRecords);
                }


            } catch (error) {
                console.error('Error:', error);
            }
            finally {
                await connection.close()
                fs.unlink(filepath, (err) => {
                    if (err) {
                        console.error('Wystąpił błąd podczas usuwania pliku: ', err);
                        return;
                    } else {
                        console.log('Usunęło plik');
                        return;
                    }
                });
                process.exit(0);
            }
        })
        .on('error', (error) => {
            console.error('Wystąpił błąd podczas parsowania pliku,', error);
            return;
        });

}

try {
    runSeleniumTest(process.env.path2, process.env.csvPath2);
} catch (err) {
    console.error('Wystąpił błąd podczas uruchamiania testu');
}
