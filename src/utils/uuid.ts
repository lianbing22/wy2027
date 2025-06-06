/**
 * 生成UUID的兼容函数，替代Node.js的crypto.randomUUID
 * 这个函数在浏览器环境中运行良好
 */
export function generateUUID(): string {
  // 使用crypto.randomUUID()（如果可用）
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // 回退到使用Math.random()的实现
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 提供一个与Node.js crypto.randomUUID兼容的接口
 */
export function randomUUID(): string {
  return generateUUID();
} 