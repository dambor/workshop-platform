export interface ChatConfig {
    enabled: boolean;
    apiUrl: string;
    flowId: string;
    langflowId: string;
    orgId: string;
}

export const chatConfig: ChatConfig = {
    enabled: false,
    apiUrl: 'https://aws-us-east-2.langflow.datastax.com',
    flowId: 'a0800574-fffc-4db5-893a-e94a2ef94fff',
    langflowId: 'c99dc146-0408-4acd-a280-e73cdbcb51a2',
    orgId: 'e01bd8e9-8703-4a3c-80fb-850f9ee2e84c',
};
