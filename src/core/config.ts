import dotenv from 'dotenv';
dotenv.config();

export const AppConfig = {
    PORT: process.env.PORT || '8000',
    INIT_PATH: `/${process.env.NAME_INIT_PATH}` || '/api',
    SOCKET_IO_ENABLED: process.env.SOCKET_IO === 'on',
};