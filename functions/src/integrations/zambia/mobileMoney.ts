import { MTNService } from './providers/mtn';
import { AirtelService } from './providers/airtel';
import { ZamtelService } from './providers/zamtel';
import { validateMobileMoneyRequest } from './validation';
import type { MobileMoneyRequest, PaymentResponse } from './types';

export class MobileMoneyService {
    private mtnService: MTNService;
    private airtelService: AirtelService;
    private zamtelService: ZamtelService;

    constructor() {
        this.mtnService = new MTNService();
        this.airtelService = new AirtelService();
        this.zamtelService = new ZamtelService();
    }

    public async initiatePayment(request: MobileMoneyRequest): Promise<PaymentResponse> {
        // Validate request
        validateMobileMoneyRequest(request);

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
