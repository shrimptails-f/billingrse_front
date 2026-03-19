FROM node:24-bookworm

ARG APP_ROOT

ENV TZ=Asia/Tokyo \
    LANG=ja_JP.UTF-8 \
    LANGUAGE=ja_JP:ja \
    LC_ALL=ja_JP.UTF-8

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    locales \
    vim \
    keychain \
    ripgrep \
    sudo \
    curl \
    ca-certificates && \
    localedef -i ja_JP -c -f UTF-8 -A /usr/share/locale/locale.alias ja_JP.UTF-8 && \
    curl -sL "https://github.com/go-task/task/releases/download/v3.9.0/task_linux_amd64.deb" -o task.deb && \
    dpkg -i task.deb && \
    rm task.deb && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Codex インストール
RUN npm i -g @openai/codex

# ここから "node" ユーザー前提で設定する
WORKDIR $APP_ROOT
RUN mkdir -p $APP_ROOT && chown -R node:node /home/node
RUN npm install -g @aikidosec/safe-chain \
    safe-chain setup

USER node

# gitブランチを表示する設定を追加
COPY --chown=node:node .devcontainer/infra/NextJs/.bashrc /home/node/.bashrc

# Claude Code インストール
RUN curl -fsSL https://claude.ai/install.sh | bash && \
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> /home/node/.bashrc && \
    echo 'eval `keychain --eval --agents ssh id_rsa 2>/dev/null`' >> /home/node/.bashrc

ENV PATH="/home/node/.local/bin:${PATH}"
