import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateInvoiceInput } from './dto/create-invoice.input';
import getMonthNameDe from 'src/helpers/getMonthNameDe';
import { InvoiceService } from './invoice.service';
import * as PDFDocument from 'pdfkit';
import { AuthGuard } from 'src/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}
  @Post('/:month/:year')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/pdf')
  async createInvoicePdf(
    @Res() res: Response,
    @Param('month') month: string,
    @Param('year') year: string,
    @Body() body: CreateInvoiceInput,
  ) {
    const doc = new PDFDocument({ bufferPages: true });

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Abrechnung-${getMonthNameDe(month)}-${year}${
        body.withDetails ? '-detalliert' : ''
      }.pdf`,
    );

    doc.on('data', (chunk) => res.write(chunk));
    doc.on('end', () => {
      res.send();
    });

    this.invoiceService.createPlayersInvoice(doc, body, month, year);
  }
}
