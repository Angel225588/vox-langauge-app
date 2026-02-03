/**
 * Whisper Configuration
 *
 * Supports both OpenAI API and self-hosted Whisper server.
 *
 * Self-Hosted Options:
 * 1. faster-whisper (Python) - 4x faster than OpenAI Whisper
 * 2. whisper.cpp (C++) - Very fast, low memory
 * 3. WhisperX - Word-level timestamps + speaker diarization
 *
 * Cost Comparison (1 Million Users):
 *
 * OpenAI API:
 * - $0.006 per minute of audio
 * - Average 2 min recording = $0.012 per session
 * - 1M users × 5 sessions/day = 5M sessions/day
 * - Daily cost: 5M × $0.012 = $60,000/day = $1.8M/month
 *
 * Self-Hosted (VPS):
 * - GPU Server (A10G): ~$1,000/month
 * - Can handle 50-100 concurrent transcriptions
 * - ~150,000 transcriptions/day per server
 * - For 5M sessions/day: ~35 servers = $35,000/month
 * - SAVINGS: ~$1.76M/month (98% cost reduction!)
 *
 * Recommended: Start with OpenAI API for MVP, switch to self-hosted at scale.
 */

// ============================================================================
// Configuration
// ============================================================================

export type WhisperProvider = 'openai' | 'self-hosted';

export interface WhisperConfig {
  /** Which provider to use */
  provider: WhisperProvider;

  /** OpenAI API configuration */
  openai?: {
    apiKey: string;
    model: 'whisper-1';
  };

  /** Self-hosted server configuration */
  selfHosted?: {
    /** Base URL of your Whisper server */
    baseUrl: string;
    /** Optional API key for your server */
    apiKey?: string;
    /** Model to use (small, medium, large-v3) */
    model: 'tiny' | 'base' | 'small' | 'medium' | 'large-v2' | 'large-v3';
  };
}

/**
 * Default configuration - uses environment variables
 */
export function getWhisperConfig(): WhisperConfig {
  const openaiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const selfHostedUrl = process.env.EXPO_PUBLIC_WHISPER_SERVER_URL;
  const selfHostedKey = process.env.EXPO_PUBLIC_WHISPER_SERVER_KEY;

  // Prefer self-hosted if configured
  if (selfHostedUrl) {
    return {
      provider: 'self-hosted',
      selfHosted: {
        baseUrl: selfHostedUrl,
        apiKey: selfHostedKey,
        model: 'large-v3', // Best accuracy
      },
    };
  }

  // Fall back to OpenAI
  if (openaiKey) {
    return {
      provider: 'openai',
      openai: {
        apiKey: openaiKey,
        model: 'whisper-1',
      },
    };
  }

  // No configuration - will use mock mode
  return {
    provider: 'openai',
  };
}

// ============================================================================
// Cost Calculator
// ============================================================================

export interface CostEstimate {
  provider: WhisperProvider;
  monthlyUsers: number;
  sessionsPerUserPerDay: number;
  avgSessionMinutes: number;
  monthlyCost: number;
  costPerUser: number;
  recommendedPricing: {
    free: { sessionsPerDay: number };
    premium: { pricePerMonth: number; sessionsPerDay: number };
  };
}

/**
 * Calculate costs for different user scales
 */
export function calculateCosts(
  monthlyUsers: number,
  sessionsPerUserPerDay: number = 5,
  avgSessionMinutes: number = 2
): CostEstimate {
  const dailySessions = monthlyUsers * sessionsPerUserPerDay;
  const monthlyMinutes = dailySessions * avgSessionMinutes * 30;

  // OpenAI pricing: $0.006 per minute
  const openaiMonthlyCost = monthlyMinutes * 0.006;

  // Self-hosted: ~$1,000/month per GPU server
  // Each server handles ~150,000 transcriptions/day
  const dailyCapacityPerServer = 150000;
  const serversNeeded = Math.ceil(dailySessions / dailyCapacityPerServer);
  const selfHostedMonthlyCost = serversNeeded * 1000;

  // Use cheaper option
  const useSelfHosted = selfHostedMonthlyCost < openaiMonthlyCost;
  const monthlyCost = useSelfHosted ? selfHostedMonthlyCost : openaiMonthlyCost;
  const provider: WhisperProvider = useSelfHosted ? 'self-hosted' : 'openai';

  const costPerUser = monthlyCost / monthlyUsers;

  return {
    provider,
    monthlyUsers,
    sessionsPerUserPerDay,
    avgSessionMinutes,
    monthlyCost,
    costPerUser,
    recommendedPricing: {
      // Free tier: limited sessions, covers costs through premium
      free: {
        sessionsPerDay: 3,
      },
      // Premium: unlimited sessions
      premium: {
        // Price should cover costs + profit margin
        // At least 3x cost per user for healthy margin
        pricePerMonth: Math.max(4.99, Math.ceil(costPerUser * 3 * 100) / 100),
        sessionsPerDay: 999, // "unlimited"
      },
    },
  };
}

/**
 * Print cost analysis for different scales
 */
export function printCostAnalysis(): void {
  console.log('\n📊 VOX LANGUAGE APP - WHISPER COST ANALYSIS\n');
  console.log('='.repeat(60));

  const scales = [1000, 10000, 100000, 1000000];

  for (const users of scales) {
    const estimate = calculateCosts(users);
    console.log(`\n👥 ${users.toLocaleString()} Monthly Active Users:`);
    console.log(`   Provider: ${estimate.provider.toUpperCase()}`);
    console.log(`   Monthly Cost: $${estimate.monthlyCost.toLocaleString()}`);
    console.log(`   Cost/User: $${estimate.costPerUser.toFixed(4)}`);
    console.log(`   Recommended Premium: $${estimate.recommendedPricing.premium.pricePerMonth}/month`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 RECOMMENDATION:');
  console.log('   - Start with OpenAI API (simple, no infrastructure)');
  console.log('   - Switch to self-hosted at ~50,000 users');
  console.log('   - At 1M users: Self-hosted saves ~$1.7M/month!');
  console.log('\n');
}

// ============================================================================
// Self-Hosted Server Setup Guide
// ============================================================================

export const SELF_HOSTED_SETUP_GUIDE = `
# Self-Hosted Whisper Server Setup

## Option 1: faster-whisper (Recommended)

### Server Requirements:
- Ubuntu 22.04 LTS
- NVIDIA GPU (A10G, T4, or better)
- 16GB+ RAM
- 50GB+ storage

### Installation:

\`\`\`bash
# Install CUDA
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
sudo dpkg -i cuda-keyring_1.0-1_all.deb
sudo apt update && sudo apt install -y cuda-toolkit-12-0

# Install Python dependencies
pip install faster-whisper fastapi uvicorn python-multipart

# Create server (save as whisper_server.py)
\`\`\`

### Server Code (whisper_server.py):

\`\`\`python
from fastapi import FastAPI, UploadFile, File, Form
from faster_whisper import WhisperModel
import tempfile
import os

app = FastAPI()

# Load model once at startup (uses GPU if available)
model = WhisperModel("large-v3", device="cuda", compute_type="float16")

@app.post("/v1/audio/transcriptions")
async def transcribe(
    file: UploadFile = File(...),
    model_name: str = Form("whisper-1"),
    response_format: str = Form("verbose_json"),
    language: str = Form(None),
    prompt: str = Form(None),
):
    # Save uploaded file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Transcribe with word timestamps
        segments, info = model.transcribe(
            tmp_path,
            language=language,
            initial_prompt=prompt,
            word_timestamps=True,
        )

        # Build response matching OpenAI format
        words = []
        segments_list = []

        for segment in segments:
            seg_words = []
            for word in segment.words:
                word_data = {
                    "word": word.word,
                    "start": word.start,
                    "end": word.end,
                }
                words.append(word_data)
                seg_words.append(word_data)

            segments_list.append({
                "id": segment.id,
                "start": segment.start,
                "end": segment.end,
                "text": segment.text,
                "words": seg_words,
            })

        return {
            "text": " ".join(s["text"] for s in segments_list),
            "language": info.language,
            "duration": info.duration,
            "segments": segments_list,
            "words": words,
        }

    finally:
        os.unlink(tmp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
\`\`\`

### Run the server:

\`\`\`bash
python whisper_server.py
# Server runs at http://your-vps-ip:8000
\`\`\`

### Configure Vox App:

Add to .env:
\`\`\`
EXPO_PUBLIC_WHISPER_SERVER_URL=https://your-vps-domain.com
EXPO_PUBLIC_WHISPER_SERVER_KEY=your-optional-api-key
\`\`\`

## Option 2: Docker Deployment

\`\`\`dockerfile
FROM nvidia/cuda:12.0-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y python3-pip ffmpeg
RUN pip3 install faster-whisper fastapi uvicorn python-multipart

COPY whisper_server.py /app/
WORKDIR /app

EXPOSE 8000
CMD ["python3", "whisper_server.py"]
\`\`\`

\`\`\`bash
docker build -t vox-whisper .
docker run --gpus all -p 8000:8000 vox-whisper
\`\`\`

## Performance Benchmarks:

| Model      | Accuracy | Speed (RTF) | GPU Memory |
|------------|----------|-------------|------------|
| tiny       | 72%      | 0.03        | 1GB        |
| base       | 76%      | 0.05        | 1GB        |
| small      | 82%      | 0.12        | 2GB        |
| medium     | 87%      | 0.25        | 5GB        |
| large-v3   | 92%      | 0.50        | 10GB       |

RTF = Real-Time Factor (0.5 = 2x faster than real-time)

## Scaling:

- 1 A10G GPU server: ~150,000 transcriptions/day
- Load balancer + 3 servers: ~450,000 transcriptions/day
- For 1M daily users (5 sessions each): ~35 servers needed
`;
