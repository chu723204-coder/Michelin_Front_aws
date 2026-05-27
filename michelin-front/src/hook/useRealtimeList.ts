import { useState, useEffect, useRef } from 'react';

interface BaseData {
  id: number | string;
}

/**
 * 실시간 목록과 개수를 통합 관리하는 훅
 * @param subscribeUrl SSE 연결 주소
 * @param eventName 이벤트명
 * @param initialData 초기 목록 데이터
 * @param initialCount 초기 카운트 숫자
 */
export const useRealtimeManager = <T extends BaseData>(
  subscribeUrl: string,
  eventName: string = 'message',
  initialData: T[] = [],
  initialCount: number = 0
) => {
  const [data, setData] = useState<T[]>(initialData);
  const [count, setCount] = useState<number>(initialCount);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setData(initialData);
    setCount(initialCount);

    eventSourceRef.current = new EventSource(subscribeUrl);

    eventSourceRef.current.addEventListener(eventName, (event: MessageEvent) => {
      try {
        const newItem: T = JSON.parse(event.data);

        // 1. 목록 업데이트 (중복 체크 후 추가)
        setData((prev) => {
          const isExist = prev.some((item) => item.id === newItem.id);
          if (isExist) return prev;
          return [newItem, ...prev];
        });

        // 2. 카운트 업데이트 (숫자 1 증가)
        setCount((prev) => prev + 1);

      } catch (error) {
        console.error("실시간 데이터 처리 에러:", error);
      }
    });

    eventSourceRef.current.onerror = () => {
      eventSourceRef.current?.close();
    };

    return () => {
      eventSourceRef.current?.close();
    };
  }, [subscribeUrl, eventName]);

  // 카운트 초기화 기능 (예: 알림창을 열었을 때 숫자를 0으로 만듦)
  const resetCount = () => setCount(0);

  return { data, count, setData, setCount, resetCount };
};