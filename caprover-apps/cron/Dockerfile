##################### 🚧 WARNING: ENV VARS ARE BAKED INTO THE IMAGE 🚧 #####################
# Do not make resulting images public.
#
# The env vars are encoded directly into the bin scripts inside the image. Deploy directly on server.
#
# Do not make resulting images public.
##################### 🚧 WARNING: ENV VARS ARE BAKED INTO THE IMAGE 🚧 #####################

FROM alpine:latest
ARG TZ=America/New_York
RUN apk add --no-cache tzdata && \
	cp /usr/share/zoneinfo/$TZ /etc/localtime && \
	echo $TZ > /etc/timezone

COPY bin/reset_db.sh.secret /usr/local/bin/reset_db.sh
RUN chmod +x /usr/local/bin/reset_db.sh

RUN echo "0 2 * * * /usr/local/bin/reset_db.sh /proc/1/fd/1 2>/proc/1/fd/2" >> /var/spool/cron/crontabs/root

CMD ["crond", "-f"]
