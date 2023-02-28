import { BadRequestException } from '@nestjs/common';

class InvalidTenantException extends BadRequestException {
  constructor(tenantId: any) {
    super(`An invalid tenantId was provided. '${tenantId}' must be an integer`);
  }
}

export default InvalidTenantException;
