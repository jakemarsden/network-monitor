import path from 'path';
import process from 'process';

export default {
    host: '0.0.0.0',
    port: 3010,
    staticResources: {
        dir: path.join(process.cwd(), 'dist')
    }
};
