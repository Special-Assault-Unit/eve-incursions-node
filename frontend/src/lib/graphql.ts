import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
};

export type Query = {
  __typename?: 'Query';
  spawns: Array<Spawn>;
  activeSpawns: Array<Spawn>;
  lastHighSecSpawn: LastHsSpawn;
  activeCommunities: Array<Community>;
  spawnLogs: PaginatedSpawnLogResponse;
  ratGroups: Array<RatGroup>;
};


export type QuerySpawnLogsArgs = {
  page?: Maybe<Scalars['Int']>;
};

export type Spawn = {
  __typename?: 'Spawn';
  id: Scalars['ID'];
  state: Scalars['String'];
  active: Scalars['Boolean'];
  boss: Scalars['Boolean'];
  establishedAt: Scalars['DateTime'];
  endedAt?: Maybe<Scalars['DateTime']>;
  influence: Scalars['Float'];
  constellation: Constellation;
  influenceLogs: Array<InfluenceLogEntry>;
  logs: Array<SpawnLog>;
  stagingSystem: System;
  influenceLogArray: Array<Scalars['Float']>;
};


export type Constellation = {
  __typename?: 'Constellation';
  id: Scalars['ID'];
  name: Scalars['String'];
  spawns: Array<Spawn>;
  systems: Array<System>;
  region: Region;
};

export type System = {
  __typename?: 'System';
  id: Scalars['ID'];
  name: Scalars['String'];
  constellation: Constellation;
  stations: Array<Station>;
  sovereigntyHolderID: Scalars['Float'];
  sovereigntyHolderName: Scalars['String'];
  isIsland: Scalars['Boolean'];
  size: Scalars['Float'];
  security: Scalars['Float'];
  type: Scalars['String'];
  hasRepairStation: Scalars['Boolean'];
  securityArea: Scalars['String'];
};

export type Station = {
  __typename?: 'Station';
  id: Scalars['ID'];
  name: Scalars['String'];
  hasRepairService: Scalars['Boolean'];
};

export type Region = {
  __typename?: 'Region';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type InfluenceLogEntry = {
  __typename?: 'InfluenceLogEntry';
  id: Scalars['ID'];
  influence: Scalars['Float'];
  date: Scalars['DateTime'];
  spawn: Array<Spawn>;
};

export type SpawnLog = {
  __typename?: 'SpawnLog';
  id: Scalars['ID'];
  state: Scalars['String'];
  date: Scalars['DateTime'];
  spawn: Spawn;
};

export type LastHsSpawn = {
  __typename?: 'LastHsSpawn';
  date: Scalars['DateTime'];
};

export type Community = {
  __typename?: 'Community';
  id: Scalars['ID'];
  name: Scalars['String'];
  tag: Scalars['String'];
  channel: Scalars['String'];
  language: Scalars['String'];
  tank: Scalars['String'];
  active: Scalars['Boolean'];
  timezone: Scalars['String'];
  hq: Scalars['Boolean'];
  as: Scalars['Boolean'];
  vg: Scalars['Boolean'];
};

export type PaginatedSpawnLogResponse = {
  __typename?: 'PaginatedSpawnLogResponse';
  items: Array<SpawnLog>;
  total: Scalars['Int'];
  hasMore: Scalars['Boolean'];
};

export type RatGroup = {
  __typename?: 'RatGroup';
  id: Scalars['ID'];
  name: Scalars['String'];
  rats: Array<Rat>;
};

export type Rat = {
  __typename?: 'Rat';
  name: Scalars['String'];
  id: Scalars['Float'];
  graphicId: Scalars['Float'];
  groupId: Scalars['Float'];
  hp: Hp;
  ehp: Hp;
  attackTypeId?: Maybe<Scalars['Float']>;
  attackType?: Maybe<Scalars['String']>;
  attackMultiplier?: Maybe<Scalars['Float']>;
  attackDuration?: Maybe<Scalars['Float']>;
  attackAlpha?: Maybe<Scalars['Float']>;
  attackTypes: DamageTypes;
  shieldResistances: DamageTypes;
  armorResistances: DamageTypes;
  structureResistances: DamageTypes;
  attackRange?: Maybe<Scalars['Float']>;
  orbitRange: Scalars['Float'];
  orbitSpeed: Scalars['Float'];
  chaseSpeed: Scalars['Float'];
  signatureRadius: Scalars['Float'];
  scanResolution: Scalars['Float'];
  ewar: Array<Ewar>;
};

export type Hp = {
  __typename?: 'HP';
  total: Scalars['Float'];
  shield: Scalars['Float'];
  armor: Scalars['Float'];
  structure: Scalars['Float'];
};

export type DamageTypes = {
  __typename?: 'DamageTypes';
  kinetic: Scalars['Float'];
  thermal: Scalars['Float'];
  em: Scalars['Float'];
  explosive: Scalars['Float'];
};

export type Ewar = {
  __typename?: 'Ewar';
  id: Scalars['Float'];
  name: Scalars['String'];
  values: Array<EwarValues>;
};

export type EwarValues = {
  __typename?: 'EwarValues';
  name: Scalars['String'];
  value: Scalars['Float'];
  unit?: Maybe<Scalars['String']>;
};

export type ActiveCommunitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveCommunitiesQuery = (
  { __typename?: 'Query' }
  & { activeCommunities: Array<(
    { __typename?: 'Community' }
    & Pick<Community, 'name' | 'tag' | 'channel' | 'language' | 'tank' | 'timezone' | 'hq' | 'as' | 'vg'>
  )> }
);

export type SpawnLogsQueryVariables = Exact<{
  page?: Maybe<Scalars['Int']>;
}>;


export type SpawnLogsQuery = (
  { __typename?: 'Query' }
  & { spawnLogs: (
    { __typename?: 'PaginatedSpawnLogResponse' }
    & Pick<PaginatedSpawnLogResponse, 'total'>
    & { items: Array<(
      { __typename?: 'SpawnLog' }
      & Pick<SpawnLog, 'state' | 'date'>
      & { spawn: (
        { __typename?: 'Spawn' }
        & { constellation: (
          { __typename?: 'Constellation' }
          & Pick<Constellation, 'name'>
          & { region: (
            { __typename?: 'Region' }
            & Pick<Region, 'name'>
          ) }
        ), stagingSystem: (
          { __typename?: 'System' }
          & Pick<System, 'name' | 'sovereigntyHolderID' | 'sovereigntyHolderName'>
        ) }
      ) }
    )> }
  ) }
);

export type ActiveSpawnsQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveSpawnsQuery = (
  { __typename?: 'Query' }
  & { activeSpawns: Array<(
    { __typename?: 'Spawn' }
    & Pick<Spawn, 'state' | 'id' | 'influence' | 'boss' | 'establishedAt' | 'endedAt' | 'influenceLogArray'>
    & { stagingSystem: (
      { __typename?: 'System' }
      & Pick<System, 'sovereigntyHolderID' | 'sovereigntyHolderName' | 'name' | 'security' | 'securityArea'>
    ), constellation: (
      { __typename?: 'Constellation' }
      & Pick<Constellation, 'name'>
      & { region: (
        { __typename?: 'Region' }
        & Pick<Region, 'name'>
      ), systems: Array<(
        { __typename?: 'System' }
        & Pick<System, 'name' | 'size' | 'security' | 'type' | 'securityArea'>
        & { stations: Array<(
          { __typename?: 'Station' }
          & Pick<Station, 'hasRepairService' | 'name'>
        )> }
      )> }
    ) }
  )>, lastHighSecSpawn: (
    { __typename?: 'LastHsSpawn' }
    & Pick<LastHsSpawn, 'date'>
  ) }
);

export type RatGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type RatGroupsQuery = (
  { __typename?: 'Query' }
  & { ratGroups: Array<(
    { __typename?: 'RatGroup' }
    & Pick<RatGroup, 'id' | 'name'>
    & { rats: Array<(
      { __typename?: 'Rat' }
      & Pick<Rat, 'name' | 'graphicId' | 'attackType' | 'attackAlpha' | 'attackMultiplier' | 'attackDuration' | 'attackTypeId' | 'attackRange' | 'orbitRange' | 'orbitSpeed' | 'chaseSpeed' | 'signatureRadius' | 'scanResolution'>
      & { hp: (
        { __typename?: 'HP' }
        & Pick<Hp, 'total' | 'shield' | 'structure' | 'armor'>
      ), ehp: (
        { __typename?: 'HP' }
        & Pick<Hp, 'total' | 'shield' | 'structure' | 'armor'>
      ), attackTypes: (
        { __typename?: 'DamageTypes' }
        & Pick<DamageTypes, 'kinetic' | 'thermal' | 'em' | 'explosive'>
      ), shieldResistances: (
        { __typename?: 'DamageTypes' }
        & Pick<DamageTypes, 'kinetic' | 'thermal' | 'em' | 'explosive'>
      ), armorResistances: (
        { __typename?: 'DamageTypes' }
        & Pick<DamageTypes, 'kinetic' | 'thermal' | 'em' | 'explosive'>
      ), structureResistances: (
        { __typename?: 'DamageTypes' }
        & Pick<DamageTypes, 'kinetic' | 'thermal' | 'em' | 'explosive'>
      ), ewar: Array<(
        { __typename?: 'Ewar' }
        & Pick<Ewar, 'id' | 'name'>
        & { values: Array<(
          { __typename?: 'EwarValues' }
          & Pick<EwarValues, 'name' | 'value' | 'unit'>
        )> }
      )> }
    )> }
  )> }
);


export const ActiveCommunitiesDocument = gql`
    query activeCommunities {
  activeCommunities {
    name
    tag
    channel
    language
    tank
    timezone
    hq
    as
    vg
  }
}
    `;
export const SpawnLogsDocument = gql`
    query spawnLogs($page: Int) {
  spawnLogs(page: $page) {
    items {
      state
      date
      spawn {
        constellation {
          name
          region {
            name
          }
        }
        stagingSystem {
          name
          sovereigntyHolderID
          sovereigntyHolderName
        }
      }
    }
    total
  }
}
    `;
export const ActiveSpawnsDocument = gql`
    query activeSpawns {
  activeSpawns {
    state
    id
    influence
    boss
    establishedAt
    endedAt
    influenceLogArray
    stagingSystem {
      sovereigntyHolderID
      sovereigntyHolderName
      name
      security
      securityArea
    }
    constellation {
      name
      region {
        name
      }
      systems {
        name
        size
        security
        type
        securityArea
        name
        stations {
          hasRepairService
          name
        }
      }
    }
  }
  lastHighSecSpawn {
    date
  }
}
    `;
export const RatGroupsDocument = gql`
    query ratGroups {
  ratGroups {
    id
    name
    rats {
      name
      graphicId
      hp {
        total
        shield
        structure
        armor
      }
      ehp {
        total
        shield
        structure
        armor
      }
      attackType
      attackAlpha
      attackMultiplier
      attackDuration
      attackTypeId
      attackTypes {
        kinetic
        thermal
        em
        explosive
      }
      shieldResistances {
        kinetic
        thermal
        em
        explosive
      }
      armorResistances {
        kinetic
        thermal
        em
        explosive
      }
      structureResistances {
        kinetic
        thermal
        em
        explosive
      }
      attackRange
      orbitRange
      orbitSpeed
      chaseSpeed
      signatureRadius
      scanResolution
      ewar {
        id
        name
        values {
          name
          value
          unit
        }
      }
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    activeCommunities(variables?: ActiveCommunitiesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ActiveCommunitiesQuery> {
      return withWrapper(() => client.request<ActiveCommunitiesQuery>(ActiveCommunitiesDocument, variables, requestHeaders));
    },
    spawnLogs(variables?: SpawnLogsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<SpawnLogsQuery> {
      return withWrapper(() => client.request<SpawnLogsQuery>(SpawnLogsDocument, variables, requestHeaders));
    },
    activeSpawns(variables?: ActiveSpawnsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ActiveSpawnsQuery> {
      return withWrapper(() => client.request<ActiveSpawnsQuery>(ActiveSpawnsDocument, variables, requestHeaders));
    },
    ratGroups(variables?: RatGroupsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<RatGroupsQuery> {
      return withWrapper(() => client.request<RatGroupsQuery>(RatGroupsDocument, variables, requestHeaders));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;