import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { TestResult } from '../types';
import { getCelebrityMatch } from '../constants/celebrities';

function getCategoryBar(label: string, score: number | null, color: string): string {
  const pct = score ?? 0;
  return `
    <div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#aaa;margin-bottom:3px;">
        <span>${label}</span><span>${pct}%</span>
      </div>
      <div style="background:#1a1a2e;border-radius:6px;height:8px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;background:${color};border-radius:6px;"></div>
      </div>
    </div>
  `;
}

export async function shareResult(result: TestResult): Promise<void> {
  const celebrity = getCelebrityMatch(result.iqScore);
  const celebrityName = celebrity.label;
  const celebrityEmoji = celebrity.emoji;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0a0a0f;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          width: 420px;
          padding: 32px;
        }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 28px; font-weight: 800; color: #00f5ff; letter-spacing: 2px; }
        .iq-box {
          text-align: center;
          margin-bottom: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #0a0a2e, #1a1a3e);
          border: 1px solid #00f5ff33;
          border-radius: 16px;
        }
        .iq-score {
          font-size: 64px;
          font-weight: 900;
          color: #00f5ff;
          text-shadow: 0 0 20px #00f5ff44;
        }
        .iq-label { font-size: 14px; color: #888; margin-top: 4px; }
        .celebrity {
          text-align: center;
          margin-bottom: 20px;
          padding: 14px;
          background: #12121f;
          border-radius: 12px;
          border: 1px solid #ffffff11;
        }
        .celebrity-name { font-size: 16px; font-weight: 700; color: #e0e0e0; }
        .celebrity-tag { font-size: 12px; color: #888; margin-top: 4px; }
        .categories {
          padding: 16px;
          background: #12121f;
          border-radius: 12px;
          border: 1px solid #ffffff11;
          margin-bottom: 20px;
        }
        .cat-title { font-size: 13px; color: #888; margin-bottom: 12px; font-weight: 600; }
        .ranks {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-bottom: 20px;
        }
        .rank-item { text-align: center; }
        .rank-value { font-size: 22px; font-weight: 800; color: #00f5ff; }
        .rank-label { font-size: 11px; color: #666; }
        .footer {
          text-align: center;
          font-size: 11px;
          color: #444;
          margin-top: 16px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">NeuralQ</div>
      </div>

      <div class="iq-box">
        <div class="iq-score">${result.iqScore}</div>
        <div class="iq-label">IQ Score</div>
      </div>

      ${celebrityName ? `
        <div class="celebrity">
          <div style="font-size:12px;color:#666;margin-bottom:4px;">You think like</div>
          <div class="celebrity-name">${celebrityEmoji} ${celebrityName}</div>
        </div>
      ` : ''}

      <div class="categories">
        <div class="cat-title">Category Breakdown</div>
        ${getCategoryBar('Spatial', result.spatialPercentile, '#00f5ff')}
        ${getCategoryBar('Logic', result.logicPercentile, '#a855f7')}
        ${getCategoryBar('Verbal', result.verbalPercentile, '#22c55e')}
        ${getCategoryBar('Memory', result.memoryPercentile, '#f59e0b')}
        ${getCategoryBar('Speed', result.speedPercentile, '#ef4444')}
      </div>

      ${result.globalRank || result.countryRank ? `
        <div class="ranks">
          ${result.globalRank ? `
            <div class="rank-item">
              <div class="rank-value">#${result.globalRank}</div>
              <div class="rank-label">Global Rank</div>
            </div>
          ` : ''}
          ${result.countryRank ? `
            <div class="rank-item">
              <div class="rank-value">#${result.countryRank}</div>
              <div class="rank-label">Country Rank</div>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div class="footer">Take your IQ test at NeuralQ</div>
    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({
    html,
    width: 420,
    height: 620,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share IQ Result',
    });
  }
}
