import React from "react";
import PropTypes from "prop-types";
import {graphql, StaticQuery} from "gatsby";
import {FaArrowDown} from "react-icons/fa/";

const Hero = props => {
  const theme = props.theme

  return (
    <StaticQuery
      query={graphql`
          query HeroBgQuery {
            bgDesktop: imageSharp(fluid: { originalName: { regex: "/hero-background/" } }) {
              resize(width: 1200, quality: 90, cropFocus: CENTER) {
                src
              }
            }
            bgTablet: imageSharp(fluid: { originalName: { regex: "/hero-background/" } }) {
              resize(width: 800, height: 1100, quality: 90, cropFocus: CENTER) {
                src
              }
            }
            bgMobile: imageSharp(fluid: { originalName: { regex: "/hero-background/" } }) {
              resize(width: 450, height: 850, quality: 90, cropFocus: CENTER) {
                src
              }
            }
          }
        `}
      render={data => {

        // Scroll to content arrow
        const separator = React.createRef();
        const scrollToContent = e => {
          separator.current.scrollIntoView({block: "start", behavior: "smooth"});
        };

        const bgDesktop = data.bgDesktop.resize.src;
        const bgTablet = data.bgTablet.resize.src;
        const bgMobile = data.bgMobile.resize.src;

        return (
          <React.Fragment>
            <section className="hero">
              <h1>
                The Open Construct Foundation
              </h1>
            </section>

            {/* --- STYLES --- */}
            <style jsx>{`

              .hero {
                align-items: center;
                background: ${theme.hero.background};
                background-image: url(${bgMobile});
                background-size: cover;
                color: ${theme.text.color.primary.inverse};
                display: flex;
                flex-flow: column nowrap;
                justify-content: center;
                padding: ${theme.space.inset.l};
                padding-top: ${theme.header.height.homepage};
                padding-bottom: 0;
              }

              h1 {
                text-align: center;
                font-size: ${theme.hero.h1.size};
                margin: ${theme.space.inset.l};
                color: ${theme.hero.h1.color};
                line-height: ${theme.hero.h1.lineHeight};
                text-remove-gap: both 0 "Open Sans";

                :global(strong) {
                  position: relative;

                  &::after,
                  &::before {
                    content: "›";
                    color: ${theme.text.color.attention};
                    margin: 0 ${theme.space.xs} 0 0;
                    text-shadow: 0 0 ${theme.space.s} ${theme.color.neutral.gray.k};
                  }
                  &::after {
                    content: "‹";
                    margin: 0 0 0 ${theme.space.xs};
                  }
                }
              }

              button {
                background: ${theme.color.brand.primaryDark};
                border: 0;
                border-radius: 10%;
                font-size: ${theme.font.size.m};
                padding: ${theme.space.s} ${theme.space.m};
                cursor: pointer;
                width: ${theme.space.sm};
                height: ${theme.space.sm};

                &:focus {
                  outline-style: none;
                  background: ${theme.color.brand.primary.active};
                }

                :global(svg) {
                  position: relative;
                  top: 5px;
                  fill: ${theme.color.neutral.white};
                  stroke-width: 40;
                  stroke: ${theme.color.neutral.white};
                  animation-duration: ${theme.time.duration.long};
                  animation-name: buttonIconMove;
                  animation-iteration-count: infinite;
                }
              }

              @keyframes buttonIconMove {
                0% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-10px);
                }
                100% {
                  transform: translateY(0);
                }
              }

              @from-width tablet {
                .hero {
                  background-image: url(${bgTablet});
                }

                h1 {
                  max-width: 90%;
                  font-size: ${`calc(${theme.hero.h1.size} * 1.3)`};
                }

                button {
                  font-size: ${theme.font.size.l};
                }
              }

              @from-width desktop {
                .hero {
                  background-image: url(${bgDesktop});
                }

                h1 {
                  max-width: 80%;
                  font-size: ${`calc(${theme.hero.h1.size} * 1.5)`};
                }

                button {
                  font-size: ${theme.font.size.xl};
                }
              }
            `}</style>
          </React.Fragment>
        );
      }}/>);
}

Hero.propTypes = {
  theme: PropTypes.object.isRequired
};

export default Hero;
