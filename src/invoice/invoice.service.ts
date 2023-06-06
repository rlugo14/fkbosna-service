import { Injectable } from '@nestjs/common';
import {
  CreateInvoiceInput,
  FineData,
  Player,
  PlayerBasedFinesByCategoryType,
} from './dto/create-invoice.input';
import getNormalizedPriceDe from 'src/helpers/getNormalizedPriceDe';
import { fineCategoryToLabel } from 'src/fines/models/fine-type.model';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';
import getMonthNameDe from 'src/helpers/getMonthNameDe';

@Injectable()
export class InvoiceService {
  private doc: PDFKit.PDFDocument;
  private invoiceMonth: string;
  private invoiceYear: string;
  private withDetails: boolean;
  private buffers: any[];
  private pdfData: Buffer;
  constructor(
    private readonly httpService: HttpService,
    private readonly s3: S3ManagerService,
  ) {}
  async createPlayersInvoice(
    doc: PDFKit.PDFDocument,
    createInvoiceInput: CreateInvoiceInput,
    invoiceMonth: string,
    invoiceYear: string,
  ) {
    this.doc = doc;
    this.invoiceMonth = invoiceMonth;
    this.invoiceYear = invoiceYear;
    const {
      finesData: fines,
      playersData: players,
      withDetails,
      tenantName,
      tenantSlug,
      tenantImageName,
    } = createInvoiceInput;
    this.withDetails = withDetails;

    await this.createDocumentHeader(tenantName, tenantSlug, tenantImageName);
    players.forEach((player) => {
      const total = this.calculateTotal(fines, player);
      this.createPlayerHeader(player, total);
      if (total > 0 && withDetails) {
        Object.keys(fines[player.id]).forEach((categoryKey) => {
          const { currX, currY } = this.nextPageIfLessRemainingSpaceThan(70);
          this.doc
            .fontSize(12)
            .font('Helvetica')
            .text(fineCategoryToLabel(categoryKey), { indent: 16 });
          this.doc.moveDown(0.2);
          this.doc
            .moveTo(currX, currY - 5)
            .lineTo(currX + 470, currY - 5)
            .lineWidth(0.5)
            .stroke();
          const playerFines = fines[player.id][categoryKey] as FineData[];
          playerFines.forEach((fine, idx) => {
            if (fine.amount > 0) {
              this.nextPageIfLessRemainingSpaceThan(70);
              this.doc.moveDown(0.5);
              this.doc.fontSize(8).text(fine.name, { indent: 32 });
              this.doc.moveDown(0.5);
              this.doc
                .text(`${fine.amount} x € ${getNormalizedPriceDe(fine.cost)}`, {
                  indent: 40,
                  continued: true,
                })
                .text(`€ ${getNormalizedPriceDe(fine.total)}`, {
                  indent: 32,
                  align: 'right',
                });
              if (idx === playerFines.length - 1) this.doc.moveDown(2);
            }
          });
        });
      }
    });
    this.createPagesFooter();
    doc.end();
  }

  private calculateTotal(
    fines: PlayerBasedFinesByCategoryType,
    player: Player,
  ) {
    if (fines[player.id])
      return Object.keys(fines[player.id]).reduce((acc, categoryKey) => {
        const finesData = fines[player.id][categoryKey] as FineData[];
        const subTotal = finesData.reduce((acc, curr) => {
          acc += curr.total;
          return acc;
        }, 0);
        acc += subTotal;
        return acc;
      }, 0);
    else return 0;
  }

  private createPlayerHeader(player: Player, total: number) {
    const { currX, currY } = this.nextPageIfLessRemainingSpaceThan(60);

    this.doc
      .fontSize(12)
      .font(this.withDetails ? 'Helvetica-Bold' : 'Helvetica')
      .text(`${player.firstname} ${player.lastname}`, currX, currY, {
        continued: true,
      });
    const lineYOffset = currY - 5;
    this.doc
      .moveTo(this.withDetails ? currX - 30 : currX, lineYOffset)
      .lineTo(this.withDetails ? currX + 500 : currX + 470, lineYOffset)
      .lineWidth(this.withDetails ? 1 : 0.5)
      .stroke();

    this.doc.text(`€ ${getNormalizedPriceDe(total)}`, { align: 'right' });
    this.doc.moveDown(1);
  }

  private nextPageIfLessRemainingSpaceThan(remainingSpace: number) {
    let currX = this.doc.x;
    let currY = this.doc.y;
    if (currY >= this.doc.page.maxY() - remainingSpace) {
      this.doc.addPage();
      currX = this.doc.page.margins.left;
      currY = this.doc.page.margins.top;
    }
    return { currX, currY };
  }

  private async createDocumentHeader(
    tenantName: string,
    tenantSlug: string,
    fileName: string,
  ) {
    const matdienstLogo = this.httpService.get(
      'https://api.matdienst.de/public/logo.png',
      {
        responseType: 'arraybuffer',
      },
    );
    const tenantLogo = await this.s3.getObject(
      this.s3.getFileKey(tenantSlug, fileName),
    );

    const matdienstLogoResponse = await firstValueFrom(matdienstLogo);
    const matdienstImageBuffer = Buffer.from(matdienstLogoResponse.data);

    const posX = this.doc.x;
    const posY = this.doc.y - 20;

    this.doc.image(matdienstImageBuffer, posX, posY, { width: 60 });
    if (tenantLogo)
      this.doc.image(tenantLogo.Body, posX + 410, posY, {
        width: 60,
        align: 'right',
      });

    this.doc.moveDown(6);
    this.doc.font('Helvetica-Bold').fontSize(20).text(tenantName);
    this.doc.font('Helvetica').fontSize(18).text('Strafen');
    this.doc.moveDown();
    this.doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(
        `Abrechnung - ${getMonthNameDe(this.invoiceMonth)} ${this.invoiceYear}`,
      );
    this.doc.moveDown();
  }

  private createPagesFooter() {
    const pages = this.doc.bufferedPageRange();
    const matdienstLinkText = 'matdienst.de';

    const currDate = new Date(Date.now());
    const day = `00${currDate.getDate()}`.slice(-2);
    const month = `00${currDate.getMonth() + 1}`.slice(-2);
    const year = currDate.getFullYear();

    for (let i = 0; i < pages.count; i++) {
      this.doc.switchToPage(i);
      const maxY = this.doc.page.maxY();
      const footerPosY = maxY - 10;

      this.doc
        .fontSize(7)
        .fillColor('#A0A0A0')
        .text('Matdienst - ', this.doc.x, footerPosY, { continued: true })
        .text(' Automatische Abrechnung generiert über ', {
          continued: true,
        })
        .text(matdienstLinkText, this.doc.x, this.doc.y, {
          continued: true,
          link: 'https://matdienst.de',
          underline: true,
        })
        .text(` am: ${day}.${month}.${year} `, {
          continued: true,
          underline: false,
        })
        .text(`Seite ${i + 1} von ${pages.count}`, this.doc.x, footerPosY, {
          align: 'right',
        });
    }
  }
}
