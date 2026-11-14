
FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       git gh curl ca-certificates ripgrep \
       openssh-client less procps \
       zsh htop nvtop \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 https://github.com/ohmyzsh/ohmyzsh.git /usr/local/share/oh-my-zsh \
    && printf '%s\n' \
        'export ZSH=/usr/local/share/oh-my-zsh' \
        'DISABLE_AUTO_UPDATE="true"' \
        'ZSH_THEME="bureau"' \
        'plugins=(git common-aliases)' \
        'source "$ZSH/oh-my-zsh.sh"' \
        >> /etc/zsh/zshrc

RUN npm install -g @opencode/cli bun

RUN mkdir -p /home/oc/.config/opencode /workspace

RUN curl -fsSL https://xerj.org/get \
    | XERJ_INSTALL_DIR=/usr/local/bin sh

COPY --from=ghcr.io/astral-sh/uv:0.13.8 /uv /uvx /usr/local/bin/

COPY ocxerj /usr/local/bin/ocxerj
RUN chmod +x /usr/local/bin/ocxerj

ENV HOME=/home/oc
ENV LANG=C.UTF-8

WORKDIR /workspace

CMD ["opencode"]
