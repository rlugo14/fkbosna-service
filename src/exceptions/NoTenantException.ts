import { BadRequestException } from '@nestjs/common';

class NoTenantException extends BadRequestException {
  constructor() {
    super('A tenantId must be provided');
  }
}

export default NoTenantException;
