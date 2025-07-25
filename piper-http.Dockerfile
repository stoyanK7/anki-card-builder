# Dockerfile for Piper HTTP server
# This file follows the instructions described in the Piper documentation
# for setting up an HTTP API server for text-to-speech:
# https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/API_HTTP.md
FROM python:3.13-slim

RUN pip install --no-cache-dir piper-tts[http]

RUN python3 -m piper.download_voices fr_FR-siwis-medium

EXPOSE 5000

CMD ["python3", "-m", "piper.http_server", "-m", "fr_FR-siwis-medium"]
