import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import * as process from 'process';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray';
import { AWSXRayIdGenerator } from '@opentelemetry/id-generator-aws-xray';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { AppConfigService } from './shared/services/app-config.service';
import { ConfigService } from '@nestjs/config';

import * as dotenv from 'dotenv';
dotenv.config();

const appConfigService = new AppConfigService(new ConfigService());
const { baseUrl, serviceName } = appConfigService.otelCollectorConfig;

// const traceExporter = new ConsoleSpanExporter();
const traceExporter = new OTLPTraceExporter({
  url: `${baseUrl}/v1/traces`,
});
const spanProcessor = new BatchSpanProcessor(traceExporter);
const xRayIdGenerator = new AWSXRayIdGenerator();

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName, // update this to a more relevant name for you!
  }),
  textMapPropagator: new AWSXRayPropagator(),
  spanProcessor,
  traceExporter,
  //   metricReader,
  instrumentations: [
    new ExpressInstrumentation(),
    new HttpInstrumentation(),
    new GraphQLInstrumentation({
      depth: 0,
      responseHook: (span) => {
        const operationType = span['attributes']['graphql.operation.type'];
        const graphqlSource = span['attributes']['graphql.source'];

        span.setAttributes({
          OperationType: operationType,
          GraphqlSource: graphqlSource,
        });
      },
    }),
    new WinstonInstrumentation({
      logHook: (span, record) => {
        const first = (record['trace_id'] as string).slice(0, 8);
        const last = (record['trace_id'] as string).slice(8);
        record['aws_xray_trace_id'] = `1-${first}-${last}@${record.span_id}`;
      },
    }),
    new NestInstrumentation(),
    new PrismaInstrumentation(),
  ],
});

otelSDK.configureTracerProvider(
  { idGenerator: xRayIdGenerator },
  spanProcessor,
);

// gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
