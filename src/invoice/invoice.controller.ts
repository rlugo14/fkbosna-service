import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateInvoiceInput } from './dto/create-invoice.input';
import { InvoiceService } from './invoice.service';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('invoice')
export class InvoiceController {
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
