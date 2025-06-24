import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

import UserModel from '../models/user.js';
import HistModel from '../models/hist.js';
import InfoModel from '../models/info.js';
import MappingModel from '../models/mapping.js';
import BacklinkModel from '../models/backlink.js';
import PenaltyModel from '../models/penalty.js';
import WikiMetaModel from '../models/wikiMeta.js';
import {UserLogModel, DocLogModel, PenaltyLogModel} from '../models/log.js';

export default class DBManager {
    static async init(WIKI_MONGO_URI: string) {
        await mongoose.connect(WIKI_MONGO_URI);
        mongoose.set('transactionAsyncLocalStorage', true);
        mongoose.connection.on('error', (e)=> {
            // TODO: Error handling
            throw new Error(e);
        });
    }

    static async backup(): Promise<void> {
        console.log('[Backup] Starting backup...');
        await this.#backupModel(UserModel);
        await this.#backupModel(HistModel);
        await this.#backupModel(InfoModel);
        await this.#backupModel(MappingModel);
        await this.#backupModel(BacklinkModel);
        await this.#backupModel(PenaltyModel);
        await this.#backupModel(WikiMetaModel);
        await this.#backupModel(UserLogModel);
        await this.#backupModel(DocLogModel);
        await this.#backupModel(PenaltyLogModel);
        console.log('[Backup] Backup complete');
    }

    static async #backupModel(DBModel: mongoose.Model<any>) {
        try {
            console.log(`[Backup] ${DBModel.modelName}`);

            const now = new Date();
            const dateStr = now.toISOString()
                .replace(/T/, '_')
                .replace(/:/g, '-')
                .replace(/\..+/, ''); // YYYY-MM-DD_HH-MM-SS
            const backupDir = path.resolve(`backups/${dateStr}`);
            const filePath = path.join(backupDir, `${DBModel.modelName}.json`);

            await fs.mkdir(backupDir, { recursive: true });

            const data = await DBModel.find().lean();
            await fs.writeFile(filePath, JSON.stringify(data), 'utf-8');

            console.log(`[✓] Backup complete: ${filePath}`);
        } catch (err) {
            console.error(`[!] Backup failed: ${DBModel.modelName}`, err);
        }
    }
}
