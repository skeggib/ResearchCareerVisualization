# Research career visualization

## Building the Docker image

`docker build . -t rcv`

## Running the image

To run the visualization on port 8000:

`docker run --name rcv -d -p 8000:80 rcv`
