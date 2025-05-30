


docker build -t test-mugjs .

docker run -e PORT=1313 -p 1313:1313 test-mugjs
