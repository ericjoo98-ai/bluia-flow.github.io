import React, { useState } from 'react';
import { X, Copy, Check, GitBranch, ShieldCheck } from 'lucide-react';

interface DeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GITHUB_ACTIONS_YAML = `name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedActions, setCopiedActions] = useState(false);

  if (!isOpen) return null;

  const handleCopyActions = () => {
    navigator.clipboard.writeText(GITHUB_ACTIONS_YAML);
    setCopiedActions(true);
    setTimeout(() => setCopiedActions(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-[#18191c] rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              GitHub Pages 배포 가이드
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs max-h-[calc(85vh-100px)] overflow-y-auto leading-relaxed">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl text-neutral-600 dark:text-neutral-300">
            <div className="font-medium text-neutral-900 dark:text-neutral-100 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
              <span>정적 호스팅 환경 설정 완료</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              <code className="font-mono text-neutral-800 dark:text-neutral-200">vite.config.ts</code>에 <code className="font-mono text-neutral-800 dark:text-neutral-200">base: './'</code>(상대 경로)가 이미 적용되어 있어 GitHub Pages 서브경로에서도 번들 에셋이 완벽하게 로드됩니다.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                1. GitHub Actions 자동 배포 (권장)
              </span>
              <button
                onClick={handleCopyActions}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-[11px] font-medium transition-colors"
              >
                {copiedActions ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedActions ? '복사됨' : 'YAML 복사'}</span>
              </button>
            </div>

            <p className="text-[11px] text-neutral-400">
              프로젝트 루트에 <code className="font-mono">.github/workflows/deploy.yml</code> 파일을 추가하고 아래 워크플로우를 저장하세요.
            </p>

            <pre className="p-3 bg-neutral-950 text-neutral-300 rounded-xl font-mono text-[10px] leading-relaxed overflow-x-auto border border-neutral-800">
              {GITHUB_ACTIONS_YAML}
            </pre>
          </div>

          <div className="space-y-1.5 pt-1 text-[11px] text-neutral-500">
            <div className="font-medium text-neutral-800 dark:text-neutral-200">2. 저장소 설정</div>
            <p>GitHub 저장소의 <strong>Settings &gt; Pages</strong> 메뉴에서 <strong>Build and deployment &gt; Source</strong>를 <strong>"GitHub Actions"</strong>로 선택하면 푸시 시 자동으로 배포됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
