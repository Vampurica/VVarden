const { createPool } = require('mysql2/promise');

const pool = createPool({
    connectionLimit   : 20,
    host              : config.host,
    user              : config.user,
    password          : config.password,
    database          : config.database,
    charset           : "utf8_general_ci",
    namedPlaceholders : true,
});

const execute = async (query, parameters) => {
    try {
        //console.time(query);
        const [result] = await pool.execute(query, parameters);
        //console.timeEnd(query);

        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    pool: pool,
    execute: execute
};