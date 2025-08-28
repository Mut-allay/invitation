"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileMoneyService = void 0;
const mtn_1 = require("./providers/mtn");
const airtel_1 = require("./providers/airtel");
const zamtel_1 = require("./providers/zamtel");
const validation_1 = require("./validation");
class MobileMoneyService {
    constructor() {
        this.mtnService = new mtn_1.MTNService();
        this.airtelService = new airtel_1.AirtelService();
        this.zamtelService = new zamtel_1.ZamtelService();
    }
    async initiatePayment(request) {
        // Validate request
        (0, validation_1.validateMobileMoneyRequest)(request);
        // Route to appropriate provider
        switch (request.provider) {
            case 'MTN':
                return this.mtnService.initiatePayment(request);
            case 'AIRTEL':
                return this.airtelService.initiatePayment(request);
            case 'ZAMTEL':
                return this.zamtelService.initiatePayment(request);
            default:
                throw new Error(`Unsupported provider: ${request.provider}`);
        }
    }
}
exports.MobileMoneyService = MobileMoneyService;
//# sourceMappingURL=mobileMoney.js.map