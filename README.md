# Research career visualization

This visualization is a nonlinear ordered representation that allows to follow
the publications of an author. It also allows you to see the topics an author
has addressed by displaying the most frequent keywords of its papers.

## Building the Docker image

`docker build . -t rcv`

## Running the image

To run the visualization on port 8000:

`docker run --name rcv -d -p 8000:80 rcv`
