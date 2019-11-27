import React, {useEffect, useState} from 'react';
import {cellWidth, Table, TableBody, TableHeader,} from '@patternfly/react-table';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Label,
  Level,
  LevelItem,
  Pagination,
  Stack,
  StackItem,
  Title,
  Tooltip
} from "@patternfly/react-core";
import {chart_color_black_200, chart_color_blue_500} from "@patternfly/react-tokens";
import displayUtils from "../../services/displayUtils";
import {
  CatalogIcon,
  DegradedIcon,
  InfoIcon,
  KeyIcon,
  PlusCircleIcon,
  SaveIcon,
  SearchIcon,
  ServiceIcon,
  Spinner2Icon,
  StorageDomainIcon
} from "@patternfly/react-icons";
import {Link} from "react-router-dom";

const CacheTableDisplay: React.FunctionComponent<any> = (props: {
  caches:  CacheInfo[]
  cacheManager: CacheManager
}) => {
  const [cachesPagination, setCachesPagination] = useState({page: 1, perPage: 10})
  const [columns, setColumns] = useState(
    [{title: 'Name', transforms: [cellWidth(25)]},
      {title: 'Type', transforms: [cellWidth(10)]},
      {title: 'Features', transforms: [cellWidth(40)]},
      {title: 'Actions', transforms: [cellWidth('max')]}])
  ;
  const [rows, setRows] = useState<(string | any)[]>([]);


  useEffect(() => {
      const initSlice = (cachesPagination.page - 1) * cachesPagination.perPage;
      updateRows(props.caches.slice(initSlice, initSlice + cachesPagination.perPage));
    },
    []);

  const onSetPage = (_event, pageNumber) => {
    setCachesPagination({
      page: pageNumber,
      perPage: cachesPagination.perPage
    });
    const initSlice = (pageNumber - 1) * cachesPagination.perPage;
    updateRows(props.caches.slice(initSlice, initSlice + cachesPagination.perPage));
  };

  const onPerPageSelect = (_event, perPage) => {
    setCachesPagination({
      page: cachesPagination.page,
      perPage: perPage
    });
    const initSlice = (cachesPagination.page - 1) * perPage;
    updateRows(props.caches.slice(initSlice, initSlice + perPage));
  };

  const updateRows = (caches) => {
    let rows: { heightAuto: boolean, cells: (string | any)[] }[];

    if (caches.length == 0) {
      rows = [{
        heightAuto: true,
        cells: [
          {
            props: {colSpan: 8},
            title: (
              <Bullseye>
                <EmptyState variant={EmptyStateVariant.small}>
                  <EmptyStateIcon icon={SearchIcon}/>
                  <Title headingLevel="h2" size="lg">
                    No caches found
                  </Title>
                  <EmptyStateBody>
                    <CreateCacheButton/>
                  </EmptyStateBody>
                </EmptyState>
              </Bullseye>
            )
          },
        ]
      }]
    } else {
      rows = caches.map(cache => {
        return {
          heightAuto: true,
          cells: [cache.name,
            {title: <CacheType type={cache.type}/>},
            {title: <CacheFeatures cache={cache}/>},
            {title: <CacheActionLinks name={cache.name}/>}]
        };
      });
    }
    setRows(rows);
  };

  const CreateCacheButton = () => {
    return <Button component="a" target="_blank" variant="link" icon={<PlusCircleIcon/>}>
        Create cache
      </Button>
  };

  const CacheActionLinks = (props: {name: string}) => {
    return (<Link to={{
      pathname: '/cache/' + props.name,
      state: {
        cacheName: props.name,
      }
    }}><InfoIcon/>More</Link>);
  };

  const CacheFeatures: React.FunctionComponent<any> = (props: {cache: CacheInfo}) => {
    const hasFeatureColor = (feature) => {
      if (feature) {
        return chart_color_blue_500.value;
      } else {
        return chart_color_black_200.value;
      }
    };

    return (<Level>
      <LevelItem><CacheFeature icon={<Spinner2Icon color={hasFeatureColor(props.cache.bounded)}/>}
                               tooltip={'Bounded'}/></LevelItem>
      <LevelItem><CacheFeature icon={<StorageDomainIcon color={hasFeatureColor(props.cache.indexed)}/>}
                               tooltip={'Indexed'}/></LevelItem>
      <LevelItem><CacheFeature icon={<SaveIcon color={hasFeatureColor(props.cache.persistent)}/>}
                               tooltip={'Persisted'}/></LevelItem>
      <LevelItem><CacheFeature icon={<ServiceIcon color={hasFeatureColor(props.cache.transactional)}/>}
                               tooltip={'Transactional'}/></LevelItem>
      <LevelItem><CacheFeature icon={<KeyIcon color={hasFeatureColor(props.cache.secured)}/>}
                               tooltip={'Secured'}/></LevelItem>
      <LevelItem><CacheFeature icon={<DegradedIcon color={hasFeatureColor(props.cache.hasRemoteBackup)}/>}
                               tooltip={'Has remote backups'}/></LevelItem>
    </Level>);
  };

  const CacheFeature = (props: { tooltip: string, icon: string }) => {
    return (<LevelItem>
      <Tooltip position="right"
               content={
                 <div>{props.tooltip}</div>
               }>
        {props.icon}
      </Tooltip></LevelItem>);
  };

  const CacheType = (props: {type: string}) => {
    return (<Label style={{backgroundColor: displayUtils.cacheTypeColor(props.type), marginRight: 15}}>
      {props.type}</Label>);
  };

  return (
    <Stack>
      <StackItem>
        <CreateCacheButton/>
        <Link to={{
          pathname: 'container/' + props.cacheManager.name + '/configurations/',
          state: {
            cacheManager: props.cacheManager.name
          }
        }}> <Button variant="link" icon={<CatalogIcon/>}>Configurations </Button>{' '}
        </Link>
      </StackItem>
      <StackItem>
        <Pagination
          itemCount={props.caches.length}
          perPage={cachesPagination.perPage}
          page={cachesPagination.page}
          onSetPage={onSetPage}
          widgetId="pagination-caches"
          onPerPageSelect={onPerPageSelect}
          isCompact={true}
        />
      </StackItem>
      <StackItem>
        <Table aria-label="Caches" cells={columns} rows={rows} className={'caches-table'}>
          <TableHeader/>
          <TableBody/>
        </Table>
      </StackItem>
    </Stack>
  );
};

export {CacheTableDisplay};
