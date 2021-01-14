const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, align, printf } = format;

const transportsFormat = combine(
  colorize(),
  timestamp(),
  align(),
  printf(log => `${log.timestamp} [${log.level}]: ${log.message}`),
);

const loggerFormat = combine(format.splat(), format.simple());

const logger = createLogger({
  format: loggerFormat,
  transports: [new transports.Console({ format: transportsFormat })],
});

module.exports = logger;
