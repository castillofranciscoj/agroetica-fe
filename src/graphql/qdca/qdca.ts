import { gql } from '@apollo/client';

export const QDCA_EXPORT_QUERY = gql`
  query QdcaExport(
    $farmId:   ID!
    $yearStart: DateTime!
    $yearEnd:   DateTime!
  ) {
    activities(
      where: {
        field: { farm: { id: { equals: $farmId } } }
        activity_date: { gte: $yearStart, lte: $yearEnd }
      }
      orderBy: { activity_date: asc }
    ) {
      id
      activity_type
      activity_date
      field {
        name
      }
      operator {
        name
        certificates
      }
      equipment {
        name
      }
      # uncomment when the relation exists
      # inputs {
      #   product { name registration_no }
      #   dose
      #   unit
      # }
    }
  }
`;
