import { jsonToString } from '@utils/index';
import logger from '@utils/logger';

type ErrorType =
  | 'accountLogin'
  | 'accountSignup'
  | 'userDevice'
  | 'comparePassword'
  | 'userDeviceToken'
  | 'forgotPassword'
  | 'resetPassword'
  | 'resetPasswordToken'
  | 'userDeviceHistory'
  | 'updateProfileImage'
  | 'accountVerification'
  | 'accountVerificationDetails'
  | 'otpVerify'
  | string;

interface ErrorPayload {
  error?: unknown;
  data?: unknown;
  bodyData?: unknown;
}

export default {
  accountErrorMessage(type: ErrorType, object: ErrorPayload): void {
    const { data, bodyData } = object;
    const error = jsonToString(object?.error);
    const payload = jsonToString(data ?? bodyData);
    let message = '';

    switch (type) {
      case 'accountLogin':
        message = `account login error: ${error}, payload: ${payload}`;
        break;
      case 'accountSignup':
        message = `account signup error: ${error}, payload: ${payload}`;
        break;
      case 'userDevice':
        message = `account user device error: ${error}, payload: ${payload}`;
        break;
      case 'comparePassword':
        message = `account compare password error: ${error}, payload: ${payload}`;
        break;
      case 'userDeviceToken':
        message = `account user device token error: ${error}, payload: ${payload}`;
        break;
      case 'forgotPassword':
        message = `account forgot password error: ${error}, payload: ${payload}`;
        break;
      case 'resetPassword':
        message = `account reset password error: ${error}, payload: ${payload}`;
        break;
      case 'resetPasswordToken':
        message = `account reset password token error: ${error}, payload: ${payload}`;
        break;
      case 'userDeviceHistory':
        message = `account user device history error: ${error}, payload: ${payload}`;
        break;
      case 'updateProfileImage':
        message = `account update profile image error: ${error}, payload: ${payload}`;
        break;
      case 'accountVerification':
        message = `Account verification error: ${error}, payload: ${payload}`;
        break;
      case 'accountVerificationDetails':
        message = `Account verification details error: ${error}`;
        break;
      case 'otpVerify':
        message = `Account verification otp verify error: ${error}`;
        break;
      default:
        message = `account error ${error}`;
        break;
    }

    logger.error(new Error(message));
  },
};
