import styled from 'styled-components';

export const AVOverviewPreview = styled.div`
  max-width: 100%;
  min-width: calc(100% - 2rem);
  margin: 1rem;

  h1 {
    font-size: 1.5rem;
    text-transform: unset;
  }

  .buttons {
    margin-left: auto;
  }

  .preview-report {
    align-items: stretch;

    > .preview-subject {
      flex: 1;
      max-width: calc(100% - 2rem);
      background-color: white;
      padding: 1rem;
      border-top-right-radius: 0.5rem;
      border-top-left-radius: 0.5rem;
      border-bottom: solid 1px black;
      box-shadow: 10px 5px 10px grey;
    }

    > .preview-body {
      flex: 1;
      max-width: calc(100% - 2rem);
      background-color: white;
      padding: 1rem;
      border-bottom-right-radius: 0.5rem;
      border-bottom-left-radius: 0.5rem;
      box-shadow: 10px 5px 10px grey;

      img {
        max-width: 80%;
      }
    }
  }
`;
