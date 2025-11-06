const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  formatLog(level, message, data) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message}:`;
    }
    return `${prefix} ${message}`;
  }

  error(message, data) {
    const formatted = this.formatLog(LOG_LEVELS.ERROR, message, data);
    console.error(formatted, data || '');
  }

  warn(message, data) {
    const formatted = this.formatLog(LOG_LEVELS.WARN, message, data);
    console.warn(formatted, data || '');
  }

  info(message, data) {
    if (this.isDevelopment) {
      const formatted = this.formatLog(LOG_LEVELS.INFO, message, data);
      console.log(formatted, data || '');
    }
  }

  debug(message, data) {
    if (this.isDevelopment) {
      const formatted = this.formatLog(LOG_LEVELS.DEBUG, message, data);
      console.debug(formatted, data || '');
    }
  }

  apiRequest(method, url, data) {
    this.debug(`API Request: ${method} ${url}`, data);
  }

  apiResponse(method, url, status, data) {
    this.debug(`API Response: ${method} ${url} - ${status}`, data);
  }

  apiError(method, url, error) {
    this.error(`API Error: ${method} ${url}`, {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      data: error.response?.data
    });
  }
}

const logger = new Logger();

export default logger;
