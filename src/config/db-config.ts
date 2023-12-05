export default () => ({
  db: {
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_ID,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});
