<template>
  <div class="runpy">
    <div class="runpy__hero">
      <header class="runpy__header">
        <div class="runpy__title">
          <span class="runpy__badge">Python WASM</span>
          <h1>RunPy 实验室</h1>
          <p>
            下载 Python WASM 虚拟机并预装 physicslab。输入代码即可在浏览器中交互运行。
          </p>
        </div>
        <div class="runpy__status" :class="{ ready: isReady }">
          <span class="runpy__status-dot"></span>
          {{ statusText }}
        </div>
      </header>
      <div class="runpy__summary">
        <div class="runpy__summary-card">
          <h3>实时运行</h3>
          <p>无需后端即可执行 Python，支持标准输出与报错提示。</p>
        </div>
        <div class="runpy__summary-card">
          <h3>physicslab 预装</h3>
          <p>加载完成后自动安装 physicslab，快速开始实验。</p>
        </div>
        <div class="runpy__summary-card">
          <h3>移动端友好</h3>
          <p>自适应布局，手机也能舒适编辑与查看输出。</p>
        </div>
      </div>
    </div>
    <section class="runpy__panel">
      <div class="runpy__editor">
        <div class="runpy__toolbar">
          <div class="runpy__toolbar-title">
            <span class="runpy__toolbar-dot"></span>
            编辑器
          </div>
          <div class="runpy__actions">
            <button
              class="runpy__button primary"
              :disabled="isLoading || isRunning"
              @click="runCode"
            >
              运行
            </button>
            <button
              class="runpy__button ghost"
              :disabled="isLoading || isRunning"
              @click="resetCode"
            >
              重置示例
            </button>
            <span v-if="isRunning" class="runpy__hint">正在执行...</span>
          </div>
        </div>
        <textarea
          v-model="code"
          class="runpy__textarea"
          spellcheck="false"
        ></textarea>
      </div>
      <div class="runpy__output">
        <div class="runpy__toolbar">
          <div class="runpy__toolbar-title">
            <span class="runpy__toolbar-dot"></span>
            输出
          </div>
          <button class="runpy__button ghost" @click="clearOutput">清空</button>
        </div>
        <pre class="runpy__pre">{{ output }}</pre>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const defaultCode = `import physicslab as pl

print("physicslab 版本:", pl.__version__)
print("可以在这里编写自己的 Python 代码。")
`;

const code = ref(defaultCode);
const output = ref("");
const isLoading = ref(true);
const isRunning = ref(false);
const isReady = ref(false);

let pyodide: any = null;

const statusText = computed(() => {
  if (isLoading.value) {
    return "Python WASM 虚拟机加载中...";
  }
  if (isRunning.value) {
    return "执行中...";
  }
  return isReady.value ? "运行环境已就绪" : "加载失败";
});

const appendOutput = (text: string) => {
  output.value += text;
};

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`无法加载脚本: ${src}`));
    document.head.appendChild(script);
  });

const initPyodide = async () => {
  try {
    output.value = "正在下载 Python WASM 虚拟机...\n";
    await loadScript("https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js");
    const globalWindow = window as typeof window & {
      loadPyodide?: (options: { indexURL: string }) => Promise<any>;
    };
    pyodide = await globalWindow.loadPyodide?.({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/",
    });
    if (!pyodide) {
      throw new Error("Pyodide 初始化失败");
    }
    pyodide.setStdout({
      batched: (text: string) => appendOutput(text),
    });
    pyodide.setStderr({
      batched: (text: string) => appendOutput(text),
    });
    appendOutput("初始化完成，正在安装 physicslab...\n");
    await pyodide.loadPackage("micropip");
    await pyodide.runPythonAsync(`
import micropip
await micropip.install("physicslab")
`);
    appendOutput("physicslab 已安装，可开始运行代码。\n");
    isReady.value = true;
  } catch (error) {
    appendOutput(`加载失败: ${(error as Error).message}\n`);
    isReady.value = false;
  } finally {
    isLoading.value = false;
  }
};

const runCode = async () => {
  if (!pyodide || isRunning.value) {
    return;
  }
  isRunning.value = true;
  output.value = "";
  try {
    await pyodide.runPythonAsync(code.value);
  } catch (error) {
    appendOutput(`运行出错: ${(error as Error).message}\n`);
  } finally {
    isRunning.value = false;
  }
};

const clearOutput = () => {
  output.value = "";
};

const resetCode = () => {
  code.value = defaultCode;
};

onMounted(() => {
  initPyodide();
});
</script>

<style scoped>
.runpy {
  display: flex;
  flex-direction: column;
  gap: 28px;
  height: 100%;
  padding: 28px 24px 32px;
  color: #e5e7eb;
  background: radial-gradient(circle at top, #243b55 0%, #0f172a 65%);
  overflow: auto;
}

.runpy__hero {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.runpy__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.runpy__title {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.runpy__badge {
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.18);
  color: #93c5fd;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.runpy__header h1 {
  margin: 0 0 8px;
  font-size: 30px;
}

.runpy__header p {
  margin: 0;
  color: #9ca3af;
}

.runpy__status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  font-weight: 600;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.25);
}

.runpy__status.ready {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.runpy__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 10px currentColor;
}

.runpy__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.runpy__summary-card {
  padding: 16px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 16px 32px rgba(2, 6, 23, 0.35);
}

.runpy__summary-card h3 {
  margin: 0 0 6px;
  font-size: 16px;
}

.runpy__summary-card p {
  margin: 0;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.5;
}

.runpy__panel {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 22px;
  flex: 1;
  min-height: 0;
}

.runpy__editor,
.runpy__output {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 20px 40px rgba(2, 6, 23, 0.4);
}

.runpy__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.runpy__toolbar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #e2e8f0;
}

.runpy__toolbar-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.9);
}

.runpy__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.runpy__textarea {
  flex: 1;
  padding: 16px;
  border: none;
  resize: none;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #e2e8f0;
  background: transparent;
  outline: none;
}

.runpy__output {
  background: rgba(2, 6, 23, 0.8);
}

.runpy__pre {
  flex: 1;
  margin: 0;
  padding: 16px;
  overflow: auto;
  color: #e2e8f0;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.runpy__button {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.runpy__button.primary {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #fff;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.35);
}

.runpy__button.ghost {
  background: rgba(148, 163, 184, 0.12);
  border-color: rgba(148, 163, 184, 0.3);
}

.runpy__button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.3);
}

.runpy__button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.runpy__hint {
  color: #93c5fd;
  font-size: 13px;
  padding-left: 4px;
}

@media (max-width: 960px) {
  .runpy {
    padding: 20px 16px 24px;
    gap: 20px;
  }

  .runpy__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .runpy__summary {
    grid-template-columns: 1fr;
  }

  .runpy__panel {
    grid-template-columns: 1fr;
  }

  .runpy__toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .runpy__actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
