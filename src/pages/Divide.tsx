import React from 'react';
import TokenEditor from '../components/TokenEditor';
import type { dragItem } from '../types/grammar';

const grammarTokens: dragItem[] = [
  { id: 'div-1', text: '변수,' },
  { id: 'div-2', text: '총개' },
  { id: 'div-3', text: '=' },
  { id: 'div-4', text: '12' },
  { id: 'div-5', text: '변수,' },
  { id: 'div-6', text: '그룹' },
  { id: 'div-7', text: '=' },
  { id: 'div-8', text: '3' },
  { id: 'div-9', text: '총개' },
  { id: 'div-10', text: '/' },
  { id: 'div-11', text: '그룹' },
  { id: 'div-12', text: '보여주기' },
];

export default function DividePage() {
  return (
    <TokenEditor
      title="나눗셈 문제"
      problem="12개를 3개의 그룹으로 나누었을 때 한 그룹에 몇 개가 들어가는지 달빛약속으로 계산하세요."
      subtitle="달빛약속 토큰을 드래그하여 나눗셈 코드를 완성하세요."
      grammarTokens={grammarTokens}
    />
  );
}
