import React from "react";
import { Link } from "react-router-dom";
import { Users, Target, Award, Globe, Heart, Rocket } from "lucide-react";

const About = () => {
  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Founder",
      image:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop&crop=faces",
      bio: "Former AI researcher at Google with passion for education technology.",
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=faces",
      bio: "Full-stack developer with 10+ years experience in edtech platforms.",
    },
    {
      name: "Emily Watson",
      role: "Head of Education",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=faces",
      bio: "Curriculum designer and former university professor.",
    },
    {
      name: "David Kim",
      role: "Product Lead",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces",
      bio: "Product manager focused on creating exceptional learning experiences.",
    },
  ];

  const values = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Learning First",
      description:
        "Everything we do is centered around effective learning outcomes and student success.",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Accessibility",
      description:
        "We believe quality education should be accessible to everyone, everywhere.",
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: "Innovation",
      description:
        "We continuously innovate to provide the best learning experience using cutting-edge technology.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Impact",
      description:
        "We're committed to making a positive impact on education worldwide.",
    },
  ];

  const milestones = [
    {
      year: "2022",
      event: "LearnAI Founded",
      description: "Started with a vision to revolutionize online learning",
    },
    {
      year: "2023",
      event: "10,000 Students",
      description: "Reached our first major milestone of active learners",
    },
    {
      year: "2024",
      event: "AI Integration",
      description: "Launched AI-powered personalized learning paths",
    },
    {
      year: "2025",
      event: "Global Expansion",
      description: "Expanded to serve students in 50+ countries",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pt-20">
      {/* Hero Section */}
      <section className="bg-white dark:bg-dark-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Revolutionizing Education with AI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            LearnAI was born from a simple belief: everyone deserves access to
            quality education that adapts to their unique learning style.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/courses"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Explore Courses
            </Link>
            <Link
              to="/contact"
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                We're on a mission to make high-quality education accessible and
                personalized for every learner worldwide. Through AI-powered
                technology, we create adaptive learning experiences that meet
                students where they are and help them achieve their goals.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Our platform combines cutting-edge artificial intelligence with
                proven educational methodologies to deliver truly personalized
                learning journeys that drive real results.
              </p>
            </div>
            <div className="bg-blue-600 rounded-2xl p-8 text-white">
              <Award className="h-12 w-12 mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                2024 EdTech Innovation Award
              </h3>
              <p className="text-blue-100">
                Recognized for our groundbreaking work in AI-powered
                personalized learning and student success tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white dark:bg-dark-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-blue-600 dark:text-blue-400">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Passionate educators, engineers, and innovators working together
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 mb-2">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 bg-white dark:bg-dark-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Journey
            </h2>
          </div>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold">{milestone.year}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {milestone.event}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
