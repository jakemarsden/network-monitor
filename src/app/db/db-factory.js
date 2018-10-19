import knex from 'knex';

export class DbFactory {

    /**
     * @param {Object} config
     * @param {string} config.host
     * @param {number} config.port
     * @param {string} config.database
     * @param {string} config.user
     * @param {string} config.password
     */
    constructor(config) {
        this.config_ = config;
        this.db_ = null;
    }

    /**
     * @return {knex}
     */
    get() {
        if (this.db_ === null) {
            this.db_ = this.initDb_();
        }
        return this.db_;
    }

    initDb_() {
        const config = this.config_;
        console.info(`Connecting to database at: ${config.user}@${config.host}:${config.port}/${config.database}`);
        return knex({
            client: 'mysql',
            connection: { ...config }
        });
    }
}
