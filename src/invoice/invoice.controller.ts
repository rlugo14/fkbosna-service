import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateInvoiceInput } from './dto/create-invoice.input';
import { InvoiceService } from './invoice.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { EmailConfirmedGuard } from 'src/guards/email-confirmed.guard';

@UseGuards(AuthGuard, EmailConfirmedGuard)
@Controller('invoice')
export class InvoiceController {
  private readonly logger = new Logger(InvoiceController.name);
  constructor(private readonly invoiceService: InvoiceService) {}
  @Post('/:month/:year')
  @HttpCode(HttpStatus.OK)
  async createInvoicePdf(
    @Param('month') month: string,
    @Param('year') year: string,
    @Body() body: CreateInvoiceInput,
  ) {
    return this.invoiceService.createPlayersInvoice(body, month, year);
  }
}
