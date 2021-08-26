const { createPool } = require('mysql2/promise');

const pool = createPool({
    connectionLimit   : 20,
    host              : 'localhost',
    user              : 'root',
    password          : '',
    database          : 'vvarden',
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