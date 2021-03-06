/* global API_HOST */
import React from 'react';
import { connect } from 'react-redux';
import { TrendGraph } from 'components/Visualizations';
import {
  getPlayerTrends,
} from 'actions';
import { playerTrends } from 'reducers';
import ButtonGarden from 'components/ButtonGarden';
import trendNames from 'components/Player/Pages/matchDataColumns';
import Heading from 'components/Heading';
import { TableFilterForm } from 'components/Form';
import Container from 'components/Container';
import { browserHistory } from 'react-router';
import strings from 'lang';
import heroes from 'dotaconstants/build/heroes.json';
import { formatSeconds, fromNow } from 'utility';
import styles from './Trends.css';

const Trend = ({ routeParams, columns, playerId, error, loading }) => (
  <div style={{ fontSize: 10 }}>
    <Heading title={strings.trends_name} subtitle={strings.trends_description} />
    <TableFilterForm />
    <ButtonGarden
      onClick={buttonName => browserHistory.push(`/players/${playerId}/trends/${buttonName}${window.location.search}`)}
      buttonNames={trendNames}
      selectedButton={routeParams.subInfo || trendNames[0]}
    />
    <Container className={styles.container} error={error} loading={loading}>
      {!columns.length ?
        <div className={styles.noData}>
          {strings.trends_no_data}
        </div> :
        <TrendGraph
          columns={columns}
          name={strings[`heading_${routeParams.subInfo || trendNames[0]}`]}
          tooltip={{
            contents: (d) => {
              const data = columns[d[0].index];
              const trendStr = strings[`heading_${routeParams.subInfo || trendNames[0]}`];
              return `<div class="${styles.tooltipWrapper}">
                <div class="${styles.value}">${strings.trends_tooltip_average} ${trendStr}: ${data.value}</div>
                <div class="${styles.match}">
                  <div>
                    <div>
                      <span class="${data.win ? styles.win : styles.loss}">
                        ${data.win ? strings.td_win : strings.td_loss}
                      </span>
                      <span class="${styles.time}">
                        ${fromNow(data.start_time)}
                      </span>
                    </div>
                    <div>
                      ${strings[`game_mode_${data.game_mode}`]}
                    </div>
                    <div>
                      ${formatSeconds(data.duration)}
                    </div>
                    <div class="${styles.matchValue}">
                      ${trendStr}: ${data.independent_value}
                    </div>
                  </div>
                  <div class="${styles.hero}">
                    <img class="${styles.heroImg}" src="${API_HOST}${heroes[data.hero_id].img}" />
                  </div>
                </div>
              </div>`;
            },
          }}
          onClick={(p) => {
            const matchId = columns[p.index].match_id;
            browserHistory.push(`/matches/${matchId}`);
          }}
        />
      }
    </Container>
  </div>
);

const getData = (props) => {
  const trendName = props.routeParams.subInfo || trendNames[0];
  props.getPlayerTrends(
    props.playerId,
    { ...props.location.query, limit: 500, project: [trendName, 'hero_id', 'start_time'] },
    trendName,
  );
};

class RequestLayer extends React.Component {
  componentWillMount() {
    getData(this.props);
  }

  componentWillUpdate(nextProps) {
    if (this.props.playerId !== nextProps.playerId
      || this.props.routeParams.subInfo !== nextProps.routeParams.subInfo
      || this.props.location.key !== nextProps.location.key) {
      getData(nextProps);
    }
  }

  render() {
    return <Trend {...this.props} />;
  }
}

const mapStateToProps = (state, { playerId }) => ({
  columns: playerTrends.getTrendsList(state, playerId),
  loading: playerTrends.getLoading(state, playerId),
  error: playerTrends.getError(state, playerId),
});

export default connect(mapStateToProps, { getPlayerTrends })(RequestLayer);
