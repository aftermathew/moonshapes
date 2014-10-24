# Moonshapes: Perspectives on a Lunar / Jewish Calendar

  Moonshapes is an experiment in visualizing solar and lunar calendars, specifically
  the Gregorian calendar and the Jewish (Hillel) calendar.

  Moonshapes attempts to make intuitive the relationship between years, months,
  legends, holidays and seasons.

  Our intention is that Moonshapes ship with a printed calendar as well.


## Team

  - __Product Owner__: Mathew Chasan, mathew@thebigincredible.com

## Table of Contents

1. [Technologies and Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)


## Technologies and Requirements

### Technologies ###
  Moonshapes is based in _Angular_ and is essentially a handful of custom factories,
  directies and controllers.  Initially it was intended that Moonshapes be
  distributed as an app first, and for that reason _Ionic_ was chosen as a base.  As the project matures, it's looking more likely that Moonshapes will be initially distributed as a website.  It's possible that at that time we'll move from an _Ionic_ base to some other _Angular_ based seed or generator.

### Dependencies ###
  Moonshapes relies rather heavily on the following libraries:

- Angular
- D3
- HebCal
- SunCalc

  _Bower_ is used to manage front end depenedencies.

## Development

### Installing Dependencies

To play around with Moonshapes yourself,
first follow the installation instructions for _Ionic_.  If you follow the instructions for developing on an Ionic sample project, you'll find it easy to get started here.  Once Ionic, Gulp, and Bower are all installed globally, you should be mostly good to go.

For advanced users, The following should work from the project root directory:

```sh
npm install -g bower ionic gulp
npm install
bower install
ionic serve
```

### Roadmap

Currently this project is very young, and mostly a side project of the author.  There are tons of places that I'd love to see the project mature:

#### Features:
  - Much better UI controls, and output.
  - Cleaner more ergonomic design.
  - Deeper and more valuable visualizations on the Torah/Legends of the Jewish people
  - Better visualizations on the relationship between seasons, holidays and stories.
  - Personalization based on location.
  - Better information about the origins and the 'why' of the Jewish calendar.
  - Social prompts for users.
  - Faster loading of data and interactions.


#### Tests and Dianostics:

  This is essentially a constantly changing project, with fluid goals.  As such I've treated it more as a playground then a mature codebase and have been lax on tests.  As more features are added and a direction is more clearly defined, I intend of maturing the codebase with tests as well.

## Contributing

I'd love contributions!  I do have a strong vision about where I'm going that are currently undocumented.  If this project appeals to you, please reach out so we can discuss where I'm going and how best to fit your ideas into the vision.
