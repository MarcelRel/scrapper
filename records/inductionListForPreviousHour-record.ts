import {inductionListForPreviousHourEntity} from "../types/document/inductionListForPreviousHour-entity";
import oracledb from "oracledb";
import {formatDate} from "../utils/formatDate";

export class InductionListForPreviousHourRecord implements inductionListForPreviousHourEntity{
    wave: string;
    tote?: string;
    article?: string | null;
    batch?: number | null;
    quantity?: number | null;
    time: Date;
    station?: string | null;

    constructor(obj: inductionListForPreviousHourEntity) {
        this.wave = obj.wave;
        this.tote = obj.tote;
        this.article = obj.article;
        this.batch = obj.batch;
        this.quantity = obj.quantity;
        this.time = obj.time;
        this.station = obj.station;
    }

    static async getExistingIds(connection: oracledb.Connection): Promise<Set<string>> {
        const sql = `SELECT TIME, WAVE, TOTE, ARTICLE FROM "testowa_tabela" WHERE TIME <= (SYSDATE-1/24)`

        const result = await connection.execute(sql);

        const existingIds = new Set<string>();
        for (const row of result.rows as Array <{ TIME: Date, WAVE: string | null, TOTE: string | null, ARTICLE: string | null }>) {
            const {TIME, WAVE, TOTE, ARTICLE} = row;
            const timeStr = formatDate(TIME);
            const recordKey = `${timeStr}-${WAVE === ' ' ? null : WAVE}-${TOTE === ' '  ? null : TOTE}-${ARTICLE === ' ' ? null : ARTICLE}`;
            existingIds.add(recordKey);
        }
        return existingIds;
    }

    static async insertAll(connection: oracledb.Connection, records: InductionListForPreviousHourRecord[]): Promise<void> {
        const all = records.map(record => ({
            wave: record.wave,
            tote: record.tote,
            article: record.article,
            batch: record.batch,
            quantity: record.quantity,
            time: (record.time),
            station: record.station
        }));
        const sql = `INSERT INTO "testowa_tabela" (wave, tote, article, batch, quantity, time, station) VALUES (:wave, :tote, :article, :batch, :quantity, :time, :station)`;
        const options = {autoCommit: true, batchErrors: true}

        const result = await connection.executeMany(sql, all, options);
        console.log(result.batchErrors);

        console.log(`Wstawiono ${result.rowsAffected} rekordów do tabeli Wamas_InductionListForPreviousHour`);

    }
}