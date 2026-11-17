
FROM node:22-bookworm-slim

RUN echo 'deb http://deb.debian.org/debian bookworm main contrib' \
      > /etc/apt/sources.list.d/contrib.list

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       git gh curl ca-certificates ripgrep \
       openssh-client less procps \
       zsh htop nvtop vim \
       rsync parallel \
       jq pigz zstd lz4 xz-utils bzip2 \
       ncdu tree pv progress \
       file lsof strace zip unzip \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 https://github.com/ohmyzsh/ohmyzsh.git /usr/local/share/oh-my-zsh \
    && printf '%s\n' \
        'export ZSH=/usr/local/share/oh-my-zsh' \
        'DISABLE_AUTO_UPDATE="true"' \
        'ZSH_THEME="bureau"' \
        'plugins=(git common-aliases)' \
        'source "$ZSH/oh-my-zsh.sh"' \
        >> /etc/zsh/zshrc

RUN npm install -g @opencode/cli@2.3.0 bun

COPY ecologits/package.json ecologits/package-lock.json /opt/ocbox-ecologits/
RUN npm ci --omit=dev --prefix /opt/ocbox-ecologits
COPY ecologits/ /opt/ocbox-ecologits/
COPY oc-emissions /usr/local/bin/oc-emissions
RUN chmod +x /usr/local/bin/oc-emissions

RUN mkdir -p /home/oc/.config/opencode /workspace

RUN curl -fsSL https://xerj.org/get \
    | XERJ_INSTALL_DIR=/usr/local/bin sh

COPY --from=ghcr.io/astral-sh/uv:0.13.8 /uv /uvx /usr/local/bin/

COPY ocxerj /usr/local/bin/ocxerj
RUN chmod +x /usr/local/bin/ocxerj

ENV HOME=/home/oc
ENV LANG=C.UTF-8
# OpenCode's terminal panes resolve their shell from $SHELL only, so the
# service must have it set or panes fall back to bash.
ENV SHELL=/bin/zsh

WORKDIR /workspace

CMD ["opencode"]
