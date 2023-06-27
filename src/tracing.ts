import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import * as process from 'process';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
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

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName, // update this to a more relevant name for you!
  }),
  spanProcessor: new BatchSpanProcessor(traceExporter),
  instrumentations: [
    new ExpressInstrumentation(),
    new HttpInstrumentation(),
    new GraphQLInstrumentation(),
    new NestInstrumentation(),
  ],
});

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
