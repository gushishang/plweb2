# Physics-Lab-Web v2

This project is the new version of [Physics-Lab-Web](https://plweb.turtlesim.com), a web application for [Physics Lab AR](https://turtlesim.com/products/physics-lab/index-cn.html) (Chen, J. & Zhao, L. (2017)). It only provides basic community support and **DOES NOT CONTAIN EXPERIMENT FUNCTIONS**.

- technologies used: vue3, typescript, vite, [richtext render based on c++ wasm](https://github.com/GoodenoughPhysicsLab/pltxt2htm)
- other development tools:
    + Vector icon library: https://icomoon.io/app/#/select
    + vue3 component library: https://www.naiveui.com/zh-CN/os-theme/components/t
- recommended IDE plugins: prettier, errorlens, vue3-official
- recommended browser plugins: vue.js devtools

## Environment setup

1. Install [Node.js](https://nodejs.org/) (version 22 ).
2. [Optional] Install [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) and run `nvm install 22` or download Node.js v22 manually.
3. [Optional] Install [nrm](https://github.com/Pana/nrm) (NPM Registry Manager) and run `nrm use taobao`.
4. Clone the repository and run `npm install` to install dependencies. You can ignore all warnings.
5. Run `npm run dev` to start the local server.
6. Run `npm run lint` to format the code and check ESLint.
7. Run `npm run build` to perform TypeScript checks. **After finishing, delete the docs/ folder and commit.**

## Project structure
- `public/`: static resources that will be copied directly to the dist/ folder during build
- `src/`: source code
- `src/assets/`: static resources that will be processed by vite during build (e.g. images referenced in code)
- `src/components/`: Vue components
- `src/styles/`: global styles (e.g. variables, mixins)

## 中间层一览

- `getPath.ts`: 使用环境变量在开发环境和生产环境指向了不同的url window.$getPath("url")
- `eventEmitter.ts`: 事件总线，用于页面间通信，传统的发布-订阅模式
- `utils.ts`: 存储字符串、对象以至于数据库等操作都会走这里
- `richTextParser`: 富文本解析器以后会使用wasm重构
- `api/`: 把物实的请求结果转换为我们自己希望的数据结构，包含请求前后的特殊的拦截器
- `storage.ts`：所有存储相关的都走这里
- `eventLogger.ts`：日志系统
- `errroLogger.ts`： debugger模式
- `config/`： 保护用户设置界面配置（部分实现）和项目runtime配置（没实现）
- `views/`: 页面
- `router/`: 增加页面后需要在此把url映射到页面


