import requestIp from 'request-ip'

// inside middleware handler
export const ipMiddleware = function(req, res, next) {
    req.clientIpAddressFound = requestIp.getClientIp(req);
    // console.log(req.clientIpAddressFound)
    next();
};
