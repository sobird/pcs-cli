import {
  mkdtempSync, writeFileSync, readFileSync, rmSync, statSync,
} from 'fs';
import { tmpdir } from 'os';
import { join, basename } from 'path';

import { splitFile } from './splitFile';

describe('splitFile', () => {
  let testDir: string;
  const TEST_FILE_NAME = 'test-file.bin';

  beforeAll(() => {
    // 创建主测试目录
    testDir = mkdtempSync(join(tmpdir(), 'splitfile-test-'));
  });

  afterAll(() => {
    // 清理所有测试文件
    rmSync(testDir, { recursive: true, force: true });
  });

  /**
   * 创建测试文件并返回路径
   */
  function createTestFile(content: Buffer | string, name = TEST_FILE_NAME): string {
    const filePath = join(testDir, name);
    writeFileSync(filePath, content);
    return filePath;
  }

  /**
   * 验证分片文件
   */
  function verifyParts(originalPath: string, parts: string[], chunkSize: number): void {
    const originalContent = readFileSync(originalPath);
    let offset = 0;

    parts.forEach((partPath, index) => {
      const partContent = readFileSync(partPath);
      const expectedSize = index === parts.length - 1
        ? originalContent.length - offset
        : chunkSize;

      expect(partContent.length).toBe(expectedSize);
      expect(partContent.equals(originalContent.subarray(offset, offset + chunkSize))).toBe(true);
      offset += partContent.length;
    });

    expect(offset).toBe(originalContent.length);
  }

  describe('正常场景', () => {
    test('文件大小是chunkSize的整数倍', async () => {
      const content = Buffer.alloc(1000, 'A');
      const filePath = createTestFile(content);
      const chunkSize = 200;

      const parts = await splitFile(filePath, chunkSize, testDir);

      expect(parts).toHaveLength(5);
      verifyParts(filePath, parts, chunkSize);
    });

    test('文件大小不是chunkSize的整数倍', async () => {
      const content = Buffer.alloc(1234, 'B');
      const filePath = createTestFile(content);
      const chunkSize = 500;

      const parts = await splitFile(filePath, chunkSize, testDir);

      expect(parts).toHaveLength(3);
      verifyParts(filePath, parts, chunkSize);
    });

    test('chunkSize大于文件大小', async () => {
      const content = Buffer.alloc(100, 'C');
      const filePath = createTestFile(content);
      const chunkSize = 1000;

      const parts = await splitFile(filePath, chunkSize, testDir);

      expect(parts).toHaveLength(1);
      verifyParts(filePath, parts, chunkSize);
    });

    test('处理文本文件', async () => {
      const content = 'Hello\nWorld\n'.repeat(100);
      const filePath = createTestFile(content, 'test.txt');
      const chunkSize = 30;

      const parts = await splitFile(filePath, chunkSize, testDir);

      verifyParts(filePath, parts, chunkSize);
    });

    test('处理二进制文件', async () => {
      // 生成随机二进制数据
      const content = Buffer.from(
        Array.from({ length: 500 }, () => { return Math.floor(Math.random() * 256); }),
      );
      const filePath = createTestFile(content, 'binary.dat');
      const chunkSize = 100;

      const parts = await splitFile(filePath, chunkSize, testDir);

      verifyParts(filePath, parts, chunkSize);
    });
  });

  describe('边界场景', () => {
    test('空文件', async () => {
      const filePath = createTestFile(Buffer.alloc(0));
      const chunkSize = 1024;

      const parts = await splitFile(filePath, chunkSize, testDir);

      expect(parts).toHaveLength(0);
    });

    test('chunkSize等于1字节', async () => {
      const content = Buffer.from('Hello');
      const filePath = createTestFile(content, 'tiny.txt');
      const chunkSize = 1;

      const parts = await splitFile(filePath, chunkSize, testDir);

      expect(parts).toHaveLength(5);
      parts.forEach((part, i) => {
        expect(readFileSync(part)).toEqual(content.subarray(i, i + 1));
      });
    });

    test('输出目录不存在', async () => {
      const content = Buffer.alloc(100, 'D');
      const filePath = createTestFile(content);
      const newDir = join(testDir, 'non-existent', 'subdir');

      const parts = await splitFile(filePath, 50, newDir);

      expect(parts.length).toBeGreaterThan(0);
      expect(statSync(newDir).isDirectory()).toBe(true);
      verifyParts(filePath, parts, 50);
    });

    test('文件名包含特殊字符', async () => {
      const content = Buffer.alloc(200, 'E');
      const filePath = createTestFile(content, 'file-with-dots.and spaces.123.txt');
      const chunkSize = 100;

      const parts = await splitFile(filePath, chunkSize, testDir);

      expect(parts.length).toBe(2);
      expect(basename(parts[0])).toContain('file-with-dots.and spaces.123.txt.1');
    });
  });

  describe('错误处理', () => {
    test('文件不存在', async () => {
      await expect(
        splitFile('/non/existent/file.txt', 1024, testDir),
      ).rejects.toThrow();
    });

    test('chunkSize为0', async () => {
      const filePath = createTestFile(Buffer.alloc(100));
      await expect(splitFile(filePath, 0, testDir)).rejects.toThrow('chunkSize must be a positive integer');
    });

    test('chunkSize为负数', async () => {
      const filePath = createTestFile(Buffer.alloc(100));
      await expect(
        splitFile(filePath, -100, testDir),
      ).rejects.toThrow('chunkSize must be a positive integer');
    });

    test('chunkSize为小数', async () => {
      const filePath = createTestFile(Buffer.alloc(100));
      await expect(
        splitFile(filePath, 100.5, testDir),
      ).rejects.toThrow('chunkSize must be a positive integer');
    });

    test('path参数为空字符串', async () => {
      await expect(
        splitFile('', 1024, testDir),
      ).rejects.toThrow('path must be a non-empty string');
    });

    test('outputDir参数为空字符串', async () => {
      const filePath = createTestFile(Buffer.alloc(100));
      await expect(
        splitFile(filePath, 1024, ''),
      ).rejects.toThrow('outputDir must be a non-empty string');
    });

    test('path为目录而非文件', async () => {
      await expect(
        splitFile(testDir, 1024, testDir),
      ).rejects.toThrow(); // stat 会失败
    });
  });

  describe('性能测试', () => {
    test('处理大文件（100MB）', async () => {
      const size = 100 * 1024 * 1024; // 100MB
      const chunkSize = 10 * 1024 * 1024; // 10MB
      const content = Buffer.alloc(size, 'F');
      const filePath = createTestFile(content, 'large-file.bin');

      const startTime = Date.now();
      const parts = await splitFile(filePath, chunkSize, testDir);
      const duration = Date.now() - startTime;

      expect(parts).toHaveLength(10);
      verifyParts(filePath, parts, chunkSize);

      // 性能断言：应在1秒内完成
      expect(duration).toBeLessThan(1000);
    }, 5000); // 超时时间设为5秒
  });

  describe('并发调用', () => {
    test('同时分割多个文件', async () => {
      const files = [
        { name: 'concurrent1.bin', content: Buffer.alloc(300, 'X') },
        { name: 'concurrent2.bin', content: Buffer.alloc(600, 'Y') },
        { name: 'concurrent3.bin', content: Buffer.alloc(900, 'Z') },
      ];

      const filePaths = files.map((f) => { return createTestFile(f.content, f.name); });
      const chunkSize = 200;

      const results = await Promise.all(
        filePaths.map((path) => { return splitFile(path, chunkSize, testDir); }),
      );

      results.forEach((parts, index) => {
        verifyParts(filePaths[index], parts, chunkSize);
      });
    });

    test('同一文件的并发分割（不应冲突）', async () => {
      const content = Buffer.alloc(500, 'M');
      const filePath = createTestFile(content, 'same-file.bin');
      const chunkSize = 100;

      const results = await Promise.all([
        splitFile(filePath, chunkSize, join(testDir, 'concurrent-a')),
        splitFile(filePath, chunkSize, join(testDir, 'concurrent-b')),
      ]);

      expect(results[0]).not.toEqual(results[1]); // 输出路径不同
      verifyParts(filePath, results[0], chunkSize);
      verifyParts(filePath, results[1], chunkSize);
    });
  });
});
