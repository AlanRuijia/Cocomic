import React from 'react';
import PropTypes from 'prop-types';
import { getIn } from 'immutable';

export class Carousel extends React.Component {
  constructor() {
    super();
    this.state = { branchTitle: '', branchDescription: '' };
  }

  componentDidMount() {
    $(`#carousel-${this.props.chapterId}`).carousel({
      onCycleTo: (ele) => {
        // $(`#${this.props.chapterId} #next-chapter-title`).text(`Chapter ${$(ele).index().toString()}`);
        // $(`#${this.props.chapterId} #next-chapter-description`).text(`${$(ele).index().toString()} So, after those actions get dispatched, where do they get handled? That happens in the reducer.`);
        this.selectItem($(ele).index());
        this.props.selectBranch(this.props.childrenIds.get($(ele).index()));
      },
      noWrap: true,
    });
  }

  selectItem(index) {
    const chapter = this.props.getChapter(this.props.childrenIds.get(index));
    this.setState({ branchTitle: chapter.get('title'), branchDescription: chapter.get('description') });
  }

  render() {
    if (this.props.childrenIds === undefined) {
      return (<div>end of book</div>);
    }
    const branchComp = this.props.childrenIds.map((childId, index) => {
      const chapter = this.props.getChapter(childId);
      const imageUrl = getIn(chapter, ['images', 0]);
      return (
        <a className="carousel-item" href={index} key={childId} >
          <img src={require(`../image/${imageUrl}.jpg`)} alt={index} />
        </a>
      );
    });
    return (
      <div id={this.props.chapterId}>
        <div id={`carousel-${this.props.chapterId}`} className="carousel branch-carousel">
          {branchComp}
        </div>
        <p id="next-chapter-title" className="next-chapter-info" >{this.state.branchTitle}</p>
        <p id="next-chapter-description" className="next-chapter-info">{this.state.branchDescription}</p>
      </div>
    );
  }
}

Carousel.propTypes = {
  chapterId: PropTypes.number.isRequired,
  getChapter: PropTypes.func.isRequired,
  selectBranch: PropTypes.func.isRequired,
  childrenIds: PropTypes.object,
};

Carousel.defaultProps = {
  childrenIds: undefined,
};
