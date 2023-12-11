export type AppConfig = {
  nodeEnv: string;
  appName: string;
  baseDir: string;
  frontDomain: string;
  backDomain: string;
  port: number;
  apiPrefix: string;
  language: string;
};

export type AppConfigType = {
  app: AppConfig;
};
