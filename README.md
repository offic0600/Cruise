# Cruise
Cruise 巡航模式。自动驾驶最令人向往的状态，松开手，系统接管，平稳高效地抵达目的地。映射“AI 接管重复劳动、开发者轻松巡航交付”的核心理念。

## 开发环境

项目本地开发使用以下版本：

- JDK 21
- Node.js 22
- npm 10+

如果本机默认版本不一致，可直接进入项目自带环境：

```bash
cd /Users/liuzheng/Desktop/Cruise
source scripts/dev-env.sh
```

或直接用脚本执行命令：

```bash
./scripts/dev-env.sh java -version
./scripts/dev-env.sh node -v
./scripts/backend-gradle.sh bootRun
./scripts/dev-env.sh bash -lc 'cd frontend && npm run dev'
```

后端推荐使用项目脚本而不是直接执行 `./gradlew`。原因是部分网络环境下，Gradle Wrapper 通过 Java 下载发行版时会遇到 TLS 握手问题；`scripts/backend-gradle.sh` 会使用 `curl` 下载固定的 Gradle 8.10.2，再以 JDK 21 启动后端任务。

常用命令：

```bash
./scripts/backend-gradle.sh --version
./scripts/backend-gradle.sh bootRun
./scripts/backend-gradle.sh test
./scripts/dev-env.sh bash -lc 'cd frontend && npm install'
./scripts/dev-env.sh bash -lc 'cd frontend && npm run dev'
```
