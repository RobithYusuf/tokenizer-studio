import { UsageLog, Model } from '../types';

export const generateInitialUsageData = (models: Model[]): UsageLog[] => {
    if (models.length === 0) {
        return [];
    }
    
    const logs: UsageLog[] = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
        const model = models[Math.floor(Math.random() * models.length)];
        const inputTokens = Math.floor(Math.random() * 3000) + 500;
        const outputTokens = Math.floor(Math.random() * 1000) + 100;
        const costUSD = (inputTokens / 1_000_000 * model.input_per_mtok_usd) + (outputTokens / 1_000_000 * model.output_per_mtok_usd);
        const costIDR = Math.round(costUSD * 16500); // Using a fixed rate for mock data
        
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000 * (Math.random() + 0.5)); // logs over the last couple of days

        logs.push({
            id: now.getTime() - i,
            provider: model.provider,
            model: model.name,
            inputTokens,
            outputTokens,
            costUSD,
            costIDR,
            timestamp: timestamp.toISOString(),
        });
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};