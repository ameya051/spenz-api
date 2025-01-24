import logger from "../services/logger.service";
import morgan from "morgan";

const morganFormat = ":method :url :status :response-time ms";

interface LogObject {
    method: string;
    url: string;
    status: string;
    responseTime: string;
}

const loggerMiddleware = morgan(morganFormat, {
    stream: {
        write: (message: string) => {
            const logObject: LogObject = {
                method: message.split(" ")[0],
                url: message.split(" ")[1],
                status: message.split(" ")[2],
                responseTime: message.split(" ")[3],
            };
            logger.info(JSON.stringify(logObject));
        }
    }
});

export default loggerMiddleware;
